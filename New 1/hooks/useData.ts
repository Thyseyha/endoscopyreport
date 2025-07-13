import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, Report, AppSettings, Doctor, Assistant, Gender } from '../types';
import localforage from 'localforage';

interface DataContextType {
    isAuthenticated: boolean;
    isDataLoading: boolean;
    login: () => void;
    logout: () => void;
    patients: Patient[];
    getPatient: (id: string) => Patient | undefined;
    addPatient: (patient: Omit<Patient, 'reports'>) => Patient;
    addPatients: (newPatients: Omit<Patient, 'reports'>[]) => { added: number, skipped: number };
    updatePatient: (id: string, data: Partial<Omit<Patient, 'reports' | 'id'>>) => void;
    deletePatient: (id: string) => void;
    getReport: (patientId: string, reportId: string) => Report | undefined;
    addReport: (patientId: string, report: Omit<Report, 'id'>) => Report;
    updateReport: (patientId: string, reportId: string, data: Partial<Report>) => void;
    deleteReport: (patientId: string, reportId: string) => void;
    restoreData: (data: { patients: Patient[], doctors: Doctor[], assistants: Assistant[] }) => void;
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    syncData: () => void;
    clearAllData: () => void;
    doctors: Doctor[];
    addDoctor: (doctor: Omit<Doctor, 'id'>) => Doctor;
    deleteDoctor: (id: string) => void;
    getDoctor: (id: string) => Doctor | undefined;
    assistants: Assistant[];
    addAssistant: (assistant: Omit<Assistant, 'id'>) => Assistant;
    deleteAssistant: (id: string) => void;
    getAssistant: (id: string) => Assistant | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'light',
    aiEnabled: true,
    notificationsEnabled: true,
    lastSynced: null,
};

const DUMMY_DOCTORS: Doctor[] = [
    { id: 'doc-1', name: 'Dr. KY Vutha' },
    { id: 'doc-2', name: 'Dr. MAK Sopheak' },
    { id: 'doc-3', name: 'Dr. SANN Channa' },
    { id: 'doc-4', name: 'Dr. VONG Chanlina' },
    { id: 'doc-5', name: 'Dr. CHHEANG Sidet' },
    { id: 'doc-6', name: 'Dr. HAK Chanpheakdey' },
    { id: 'doc-7', name: 'Dr. LY Kimchhun' },
    { id: 'doc-8', name: 'Dr. RO Kimchhay' },
    { id: 'doc-9', name: 'Dr. OUNG Borathchakra' },
    { id: 'doc-10', name: 'Dr. LONG Chansomphy' },
    { id: 'doc-11', name: 'Dr. SENG Rithraingsey' },
    { id: 'doc-12', name: 'Dr. VANNA Chetra' },
    { id: 'doc-13', name: 'Dr. KHY Makara' },
    { id: 'doc-14', name: 'Dr. KIM Kolveasna' },
    { id: 'doc-15', name: 'Dr. OENG Leangseng' },
    { id: 'doc-16', name: 'Dr. ENG Tharo' },
    { id: 'doc-17', name: 'Dr. OUCH Punleu' },
];

const DUMMY_ASSISTANTS: Assistant[] = [
    { id: 'asst-1', name: 'DES. THY Seyha' },
];


const useLocalForage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] => {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        localforage.getItem<T>(key).then(value => {
            if (isMounted) {
                if (value !== null) {
                    setStoredValue(value);
                }
                setLoading(false);
            }
        }).catch(err => {
            console.error(`Error reading from localforage key "${key}":`, err);
            if (isMounted) setLoading(false);
        });
        
        return () => { isMounted = false; };
    }, [key]);

    useEffect(() => {
        if (!loading) { // Don't save before initial load finishes
            localforage.setItem(key, storedValue).catch(err => {
                console.error(`Error writing to localforage key "${key}":`, err);
            });
        }
    }, [key, storedValue, loading]);

    return [storedValue, setStoredValue, loading];
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated, authLoading] = useLocalForage<boolean>('endo_auth', false);
    const [patients, setPatients, patientsLoading] = useLocalForage<Patient[]>('endo_patients', []);
    const [doctors, setDoctors, doctorsLoading] = useLocalForage<Doctor[]>('endo_doctors', DUMMY_DOCTORS);
    const [assistants, setAssistants, assistantsLoading] = useLocalForage<Assistant[]>('endo_assistants', DUMMY_ASSISTANTS);
    const [settings, setSettings, settingsLoading] = useLocalForage<AppSettings>('endo_settings', DEFAULT_SETTINGS);

    const isDataLoading = authLoading || patientsLoading || doctorsLoading || assistantsLoading || settingsLoading;

    const login = () => setIsAuthenticated(true);
    const logout = () => {
        setIsAuthenticated(false);
    };

    const getPatient = (id: string) => patients.find(p => p.id === id);

    const addPatient = (patientData: Omit<Patient, 'reports'>) => {
        const newPatient: Patient = { ...patientData, id: patientData.id || `PAT-${Date.now()}`, reports: [] };
        setPatients(prev => [...prev, newPatient]);
        return newPatient;
    };
    
    const addPatients = (newPatients: Omit<Patient, 'reports'>[]) => {
        const existingIds = new Set(patients.map(p => p.id));
        const patientsToAdd = newPatients
            .filter(p => p.id && !existingIds.has(p.id))
            .map(p => ({ ...p, reports: [] as Report[] }));
        
        if (patientsToAdd.length > 0) {
            setPatients(prev => [...prev, ...patientsToAdd]);
        }
        return {
            added: patientsToAdd.length,
            skipped: newPatients.length - patientsToAdd.length,
        }
    };

    const updatePatient = (id: string, data: Partial<Omit<Patient, 'reports' | 'id'>>) => {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    };

    const deletePatient = (id: string) => {
        setPatients(prev => prev.filter(p => p.id !== id));
    };
    
    const getReport = (patientId: string, reportId: string) => {
        const patient = getPatient(patientId);
        return patient?.reports.find(r => r.id === reportId);
    };

    const addReport = (patientId: string, reportData: Omit<Report, 'id'>) => {
        const newReport: Report = { ...reportData, id: `REP-${Date.now()}` };
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                return { ...p, reports: [...p.reports, newReport] };
            }
            return p;
        }));
        return newReport;
    };

    const updateReport = (patientId: string, reportId: string, data: Partial<Report>) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                const updatedReports = p.reports.map(r => r.id === reportId ? { ...r, ...data } : r);
                return { ...p, reports: updatedReports };
            }
            return p;
        }));
    };

    const deleteReport = (patientId: string, reportId: string) => {
        setPatients(prev => prev.map(p => {
            if (p.id === patientId) {
                return { ...p, reports: p.reports.filter(r => r.id !== reportId) };
            }
            return p;
        }));
    };

    const restoreData = (data: { patients: Patient[], doctors: Doctor[], assistants: Assistant[] }) => {
        setPatients(data.patients || []);
        setDoctors(data.doctors || DUMMY_DOCTORS);
        setAssistants(data.assistants || DUMMY_ASSISTANTS);
    };

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({...prev, ...newSettings}));
    };
    
    const syncData = () => {
        updateSettings({ lastSynced: new Date().toISOString() });
    };

    const clearAllData = () => {
        setPatients([]);
        setDoctors(DUMMY_DOCTORS);
        setAssistants(DUMMY_ASSISTANTS);
        setSettings(DEFAULT_SETTINGS);
    };

    // Doctor functions
    const addDoctor = (doctorData: Omit<Doctor, 'id'>) => {
        const newDoctor: Doctor = { ...doctorData, id: `DOC-${Date.now()}` };
        setDoctors(prev => [...prev, newDoctor]);
        return newDoctor;
    };
    const deleteDoctor = (id: string) => {
        setDoctors(prev => prev.filter(d => d.id !== id));
    };
    const getDoctor = (id: string) => doctors.find(d => d.id === id);

    // Assistant functions
    const addAssistant = (assistantData: Omit<Assistant, 'id'>) => {
        const newAssistant: Assistant = { ...assistantData, id: `ASST-${Date.now()}` };
        setAssistants(prev => [...prev, newAssistant]);
        return newAssistant;
    };
    const deleteAssistant = (id: string) => {
        setAssistants(prev => prev.filter(a => a.id !== id));
    };
    const getAssistant = (id: string) => assistants.find(a => a.id === id);


    const value = { isAuthenticated, login, logout, patients, getPatient, addPatient, addPatients, updatePatient, deletePatient, getReport, addReport, updateReport, deleteReport, restoreData, settings, updateSettings, syncData, clearAllData, doctors, addDoctor, deleteDoctor, getDoctor, assistants, addAssistant, deleteAssistant, getAssistant, isDataLoading };

    return React.createElement(DataContext.Provider, { value: value }, children);
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};