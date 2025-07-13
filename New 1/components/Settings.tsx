
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useLocale } from '../hooks/useLocale';
import { Card, Button, Modal, ToggleSwitch, Input } from './ui';
import { ICONS } from '../constants';
import { Patient, Doctor, Assistant, Gender } from '../types';


const Settings: React.FC = () => {
    const { settings, updateSettings, clearAllData, logout, restoreData, patients, doctors, addDoctor, deleteDoctor, assistants, addAssistant, deleteAssistant, addPatients, syncData } = useData();
    const { t, locale, setLocale } = useLocale();
    const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

    const [newDoctorName, setNewDoctorName] = useState('');
    const [newAssistantName, setNewAssistantName] = useState('');

    // State for backup and restore
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [restoreError, setRestoreError] = useState('');
    const backupFileRef = useRef<HTMLInputElement>(null);
    
    // State for new data management features
    const [importResult, setImportResult] = useState<{added: number, skipped: number} | null>(null);
    const importFileRef = useRef<HTMLInputElement>(null);

    const handleThemeChange = (theme: 'light' | 'dark') => {
        updateSettings({ theme });
    };

    const handleClearData = () => {
        clearAllData();
        setIsClearDataModalOpen(false);
        alert(t('clear_data_success'));
        logout();
    };
    
    const handleBackup = () => {
        const backupData = {
            patients,
            doctors,
            assistants,
            settings,
        };
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `endoreport_backup_${date}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleBackupFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.type === 'application/json') {
                setBackupFile(file);
                setRestoreError('');
            } else {
                setRestoreError(t('restore_error_json'));
                setBackupFile(null);
            }
        }
    };

    const handleRestoreClick = () => {
        if (!backupFile) return;
        setIsRestoreModalOpen(true);
    };

    const confirmRestore = () => {
        if (!backupFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') { throw new Error("Failed to read file."); }
                
                const restoredData = JSON.parse(text);
                
                if (Array.isArray(restoredData.patients) && Array.isArray(restoredData.doctors) && Array.isArray(restoredData.assistants)) {
                    restoreData(restoredData as { patients: Patient[], doctors: Doctor[], assistants: Assistant[]});
                    if (restoredData.settings) {
                        updateSettings(restoredData.settings);
                    }
                    alert(t('restore_data_success'));
                    setBackupFile(null);
                    setRestoreError('');
                    if(backupFileRef.current) backupFileRef.current.value = "";
                } else {
                    throw new Error("Invalid backup file format. Expected an object with patients, doctors, and assistants arrays.");
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                console.error("Restore failed:", error);
                setRestoreError(t('restore_error_failed', { message }));
            } finally {
                setIsRestoreModalOpen(false);
            }
        };
        reader.onerror = () => {
            setRestoreError(t('restore_error_read_failed'));
            setIsRestoreModalOpen(false);
        };
        reader.readAsText(backupFile);
    };

    const triggerBackupFileSelect = () => {
        backupFileRef.current?.click();
    };

    const handleAddDoctor = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDoctorName.trim()) {
            addDoctor({ name: newDoctorName.trim() });
            setNewDoctorName('');
        }
    };

    const handleAddAssistant = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAssistantName.trim()) {
            addAssistant({ name: newAssistantName.trim() });
            setNewAssistantName('');
        }
    };

    const handleExportCsv = () => {
        const header = ['id', 'name', 'age', 'gender'];
        const csvRows = [
            header.join(','),
            ...patients.map(p => [p.id, `"${p.name}"`, p.age, p.gender].join(','))
        ];
        const csvString = csvRows.join('\n');
        const dataBlob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `endoreport_patients_${date}.csv`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').slice(1); // Skip header
            const newPatients: Omit<Patient, 'reports'>[] = rows.map(row => {
                const [id, name, age, gender] = row.split(',');
                return {
                    id: id?.trim(),
                    name: name?.trim().replace(/"/g, ''),
                    age: parseInt(age?.trim(), 10),
                    gender: gender?.trim() as Gender
                };
            }).filter(p => p.id && p.name && !isNaN(p.age) && p.gender);

            const result = addPatients(newPatients);
            setImportResult(result);
            setTimeout(() => setImportResult(null), 5000);
        };

        reader.readAsText(file);
        if(importFileRef.current) importFileRef.current.value = "";
    };

    const triggerCsvImport = () => {
        importFileRef.current?.click();
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('settings')}</h1>

            <div className="space-y-8 max-w-4xl mx-auto">
                 <Card>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{t('language')}</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 dark:text-gray-300 font-medium">{t('select_language')}</p>
                        <div className="flex items-center space-x-2">
                           <Button 
                                variant={locale === 'en' ? 'primary' : 'secondary'} 
                                onClick={() => setLocale('en')}
                                className="w-28"
                            >
                                {t('english')}
                            </Button>
                           <Button 
                                variant={locale === 'fr' ? 'primary' : 'secondary'} 
                                onClick={() => setLocale('fr')}
                                className="w-28"
                            >
                                {t('french')}
                           </Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{t('appearance')}</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 dark:text-gray-300 font-medium">{t('theme')}</p>
                        <div className="flex items-center space-x-2">
                           <Button 
                                variant={settings.theme === 'light' ? 'primary' : 'secondary'} 
                                onClick={() => handleThemeChange('light')}
                                className="w-24"
                            >
                                {t('light_theme')}
                            </Button>
                           <Button 
                                variant={settings.theme === 'dark' ? 'primary' : 'secondary'} 
                                onClick={() => handleThemeChange('dark')}
                                className="w-24"
                            >
                                {t('dark_theme')}
                           </Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{t('preferences')}</h2>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li className="py-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('enable_ai_suggestions')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('enable_ai_suggestions_desc')}</p>
                            </div>
                            <ToggleSwitch enabled={settings.aiEnabled} onChange={(enabled) => updateSettings({ aiEnabled: enabled })} />
                        </li>
                        <li className="py-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('enable_notifications')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('enable_notifications_desc')}</p>
                            </div>
                            <ToggleSwitch enabled={settings.notificationsEnabled} onChange={(enabled) => updateSettings({ notificationsEnabled: enabled })} />
                        </li>
                    </ul>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{t('staff_management')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('doctors')}</h3>
                             <ul className="mt-2 space-y-2 h-40 overflow-y-auto pr-2">
                                {doctors.map(doctor => (
                                    <li key={doctor.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{doctor.name}</span>
                                        <button onClick={() => deleteDoctor(doctor.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full">{React.cloneElement(ICONS.trash, {width: 16, height: 16})}</button>
                                    </li>
                                ))}
                            </ul>
                            <form onSubmit={handleAddDoctor} className="mt-4 flex gap-2">
                                <Input value={newDoctorName} onChange={e => setNewDoctorName(e.target.value)} placeholder={t('new_doctor_placeholder')} required />
                                <Button type="submit">{ICONS.add}</Button>
                            </form>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('assistants')}</h3>
                            <ul className="mt-2 space-y-2 h-40 overflow-y-auto pr-2">
                                {assistants.map(assistant => (
                                    <li key={assistant.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{assistant.name}</span>
                                        <button onClick={() => deleteAssistant(assistant.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full">{React.cloneElement(ICONS.trash, {width: 16, height: 16})}</button>
                                    </li>
                                ))}
                            </ul>
                             <form onSubmit={handleAddAssistant} className="mt-4 flex gap-2">
                                <Input value={newAssistantName} onChange={e => setNewAssistantName(e.target.value)} placeholder={t('new_assistant_placeholder')} required />
                                <Button type="submit">{ICONS.add}</Button>
                            </form>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{t('data_management')}</h2>
                    <div className="space-y-6">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('import_export_patients')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('import_export_patients_desc')}</p>
                                {importResult && <p className="text-sm text-green-600 dark:text-green-400 mt-2">{t('import_result', { added: importResult.added, skipped: importResult.skipped })}</p>}
                            </div>
                            <div className="flex items-center gap-2 mt-2 md:mt-0 flex-shrink-0">
                                <input type="file" ref={importFileRef} className="hidden" accept=".csv,text/csv" onChange={handleCsvFileSelect}/>
                                <Button onClick={handleExportCsv} variant="secondary">{t('export_csv')}</Button>
                                <Button onClick={triggerCsvImport} variant="secondary">{t('import_csv')}</Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('backup_data')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('backup_data_desc')}</p>
                            </div>
                            <Button onClick={handleBackup}>{t('download_backup')}</Button>
                        </div>
                        
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                           <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('restore_data')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('restore_data_desc')}</p>
                                {backupFile && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">{t('restore_data_selected', {fileName: backupFile.name})}</p>}
                                {restoreError && <p className="text-red-500 text-xs mt-2">{restoreError}</p>}
                           </div>
                            <div className="flex items-center gap-2">
                               <input type="file" ref={backupFileRef} className="hidden" accept=".json,application/json" onChange={handleBackupFileSelect}/>
                               <Button onClick={triggerBackupFileSelect} variant="secondary">{t('choose_file')}</Button>
                               <Button onClick={handleRestoreClick} disabled={!backupFile}>{t('restore_button')}</Button>
                            </div>
                        </div>

                         <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{t('data_sync')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('last_synced', {date: settings.lastSynced ? new Date(settings.lastSynced).toLocaleString() : t('never')})}</p>
                            </div>
                            <Button onClick={syncData}>{t('sync_now')}</Button>
                        </div>
                         
                        <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mt-8">
                            <div>
                                <p className="font-medium text-red-700 dark:text-red-400">{t('clear_all_data')}</p>
                                <p className="text-sm text-red-600 dark:text-red-500">{t('clear_all_data_desc')}</p>
                            </div>
                            <Button variant="danger" onClick={() => setIsClearDataModalOpen(true)}>
                                {ICONS.trash} {t('clear_all_data')}
                            </Button>
                        </div>
                    </div>
                </Card>

            </div>

            <Modal isOpen={isClearDataModalOpen} onClose={() => setIsClearDataModalOpen(false)} title={t('clear_data_modal_title')}>
                 <div className="text-center">
                    <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
                        {t('clear_data_modal_message')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {t('clear_data_modal_detail')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => setIsClearDataModalOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="danger" onClick={handleClearData}>
                            {t('yes_delete_everything')}
                        </Button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} title={t('restore_data_modal_title')}>
                 <div className="text-center">
                    <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
                        {t('restore_data_modal_message')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {t('restore_data_modal_detail')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => setIsRestoreModalOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="danger" onClick={confirmRestore}>
                            {t('yes_overwrite_and_restore')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;