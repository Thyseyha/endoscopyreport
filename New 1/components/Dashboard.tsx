
import React, { useMemo, useState } from 'react';
import { useData } from '../hooks/useData';
import { useLocale } from '../hooks/useLocale';
import { Card, Button, Modal, Input, Select } from './ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProcedureType, Gender } from '../types';
import { ICONS } from '../constants';

const RegisterPatientModal: React.FC<{isOpen: boolean, onClose: () => void}> = ({ isOpen, onClose }) => {
    const { addPatient, patients } = useData();
    const { t, getTranslatedGender } = useLocale();
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.MALE);
    const [error, setError] = useState('');

    const resetForm = () => {
        setName('');
        setId('');
        setAge('');
        setGender(Gender.MALE);
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !id.trim() || !age) {
            setError(t('form_error_required_fields'));
            return;
        }
        if (patients.some(p => p.id === id.trim())) {
            setError(t('form_error_patient_exists'));
            return;
        }

        addPatient({
            name: name.trim(),
            id: id.trim(),
            age: parseInt(age, 10),
            gender
        });
        
        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('register_new_patient_title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label={t('full_name')}
                    id="patient-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder={t('full_name_placeholder')}
                />
                <Input
                    label={t('patient_id')}
                    id="patient-id"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    required
                    placeholder={t('patient_id_placeholder')}
                />
                <Input
                    label={t('age')}
                    id="patient-age"
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    required
                    placeholder={t('age_placeholder')}
                    min="0"
                />
                <Select
                    label={t('gender')}
                    id="patient-gender"
                    value={gender}
                    onChange={e => setGender(e.target.value as Gender)}
                >
                    {Object.values(Gender).map(g => <option key={g} value={g}>{getTranslatedGender(g)}</option>)}
                </Select>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('register_patient')}</Button>
                </div>
            </form>
        </Modal>
    );
};


const Dashboard: React.FC = () => {
    const { patients, settings } = useData();
    const { t } = useLocale();
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const stats = useMemo(() => {
        const totalPatients = patients.length;
        const totalReports = patients.reduce((acc, p) => acc + p.reports.length, 0);
        
        const reportsByMonth: { [key: string]: number } = {};
        const findingsCount: { [key: string]: number } = {};
        let gastroCount = 0;
        let colonoCount = 0;
        let ercpCount = 0;
        let eusCount = 0;

        patients.forEach(p => {
            p.reports.forEach(r => {
                const month = new Date(r.procedureDate).toLocaleString('default', { month: 'short', year: 'numeric' });
                reportsByMonth[month] = (reportsByMonth[month] || 0) + 1;

                if(r.procedureType === ProcedureType.GASTROSCOPY) gastroCount++;
                if(r.procedureType === ProcedureType.COLONOSCOPY) colonoCount++;
                if(r.procedureType === ProcedureType.ERCP) ercpCount++;
                if(r.procedureType === ProcedureType.EUS) eusCount++;

                const keyDiagnosis = (r.diagnosis || '').toLowerCase().trim().replace(/\.$/, '');
                if (keyDiagnosis) {
                    findingsCount[keyDiagnosis] = (findingsCount[keyDiagnosis] || 0) + 1;
                }
            });
        });

        const chartData = Object.entries(reportsByMonth).map(([name, count]) => ({ name, procedures: count })).slice(-12);
        
        const commonFindings = Object.entries(findingsCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }));

        return { totalPatients, totalReports, chartData, gastroCount, colonoCount, ercpCount, eusCount, commonFindings };
    }, [patients]);

    const isDark = settings.theme === 'dark';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard')}</h1>
                <Button onClick={() => setIsRegisterModalOpen(true)}>
                    {ICONS.add}
                    {t('register_patient')}
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard title={t('total_patients')} value={stats.totalPatients} />
                <StatCard title={t('total_reports')} value={stats.totalReports} />
                <StatCard title={t('stat_gastroscopies')} value={stats.gastroCount} />
                <StatCard title={t('stat_colonoscopies')} value={stats.colonoCount} />
                <StatCard title={t('stat_ercps')} value={stats.ercpCount} />
                <StatCard title={t('stat_eus')} value={stats.eusCount} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('procedures_last_12_months')}</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#E2E8F0'} />
                                <XAxis dataKey="name" tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                                <YAxis tick={{ fill: isDark ? '#A0AEC0' : '#4A5568' }} />
                                <Tooltip
                                    cursor={{ fill: isDark ? 'rgba(113, 128, 150, 0.2)' : 'rgba(200, 200, 200, 0.2)'}}
                                    contentStyle={{
                                        backgroundColor: isDark ? '#2D3748' : '#FFFFFF',
                                        borderColor: isDark ? '#4A5568' : '#E2E8F0',
                                        color: isDark ? '#FFFFFF' : '#000000'
                                    }}
                                />
                                <Legend wrapperStyle={{ color: isDark ? '#A0AEC0' : '#4A5568' }}/>
                                <Bar dataKey="procedures" fill={isDark ? '#6366f1' : '#4f46e5'} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('most_common_diagnoses')}</h2>
                    <ul className="space-y-3">
                        {stats.commonFindings.length > 0 ? stats.commonFindings.map(f => (
                            <li key={f.name} className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                <span>{f.name}</span>
                                <span className="font-bold text-indigo-600 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/50 px-2 py-1 rounded-full text-sm">{f.count}</span>
                            </li>
                        )) : <p className="text-gray-500 dark:text-gray-400">{t('no_diagnoses_recorded')}</p>}
                    </ul>
                </Card>
            </div>

            <RegisterPatientModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
    <Card>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </Card>
);

export default Dashboard;
