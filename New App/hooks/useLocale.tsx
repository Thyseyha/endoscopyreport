

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import localforage from 'localforage';
import { translations, TranslationKeys, Locale } from '../i18n';
import { Gender, ProcedureType, AnesthesiaType, PatientStatus } from '../types';

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
        if (!loading) { 
            localforage.setItem(key, storedValue).catch(err => {
                console.error(`Error writing to localforage key "${key}":`, err);
            });
        }
    }, [key, storedValue, loading]);

    return [storedValue, setStoredValue, loading];
};


interface LocaleContextType {
    locale: Locale;
    isLocaleLoading: boolean;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKeys, options?: Record<string, string | number>) => string;
    getTranslatedGender: (gender: Gender) => string;
    getTranslatedProcedureType: (procType: ProcedureType) => string;
    getTranslatedAnesthesiaType: (anesthType: AnesthesiaType) => string;
    getTranslatedPatientStatus: (status: PatientStatus) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale, isLocaleLoading] = useLocalForage<Locale>('endo_locale', 'en');

    const t = (key: TranslationKeys, options?: Record<string, string | number>): string => {
        let text = translations[locale][key] || translations['en'][key] || key;
        if (options) {
            Object.keys(options).forEach(k => {
                text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(options[k]));
            });
        }
        return text;
    };

    const getTranslatedGender = (gender: Gender) => {
        const keyMap: Record<Gender, TranslationKeys> = {
            [Gender.MALE]: 'gender_male',
            [Gender.FEMALE]: 'gender_female',
            [Gender.OTHER]: 'gender_other',
        };
        return t(keyMap[gender]);
    };

    const getTranslatedProcedureType = (procType: ProcedureType) => {
        const keyMap: Record<ProcedureType, TranslationKeys> = {
            [ProcedureType.GASTROSCOPY]: 'proc_gastroscopy',
            [ProcedureType.COLONOSCOPY]: 'proc_colonoscopy',
            [ProcedureType.ERCP]: 'proc_ercp',
            [ProcedureType.EUS]: 'proc_eus',
            [ProcedureType.CHOLANGIOSCOPY]: 'proc_cholangioscopy',
            [ProcedureType.ENTEROSCOPY]: 'proc_enteroscopy',
        };
        return t(keyMap[procType]);
    };
    
    const getTranslatedAnesthesiaType = (anesthType: AnesthesiaType) => {
        const keyMap: Record<AnesthesiaType, TranslationKeys> = {
            [AnesthesiaType.GENERAL]: 'anesthesia_general',
            [AnesthesiaType.MAC]: 'anesthesia_mac',
            [AnesthesiaType.CONSCIOUS_SEDATION]: 'anesthesia_conscious_sedation',
            [AnesthesiaType.NONE]: 'anesthesia_none',
        };
        return t(keyMap[anesthType]);
    };

    const getTranslatedPatientStatus = (status: PatientStatus) => {
        const keyMap: Record<PatientStatus, TranslationKeys> = {
            [PatientStatus.OUTPATIENT]: 'status_outpatient',
            [PatientStatus.INPATIENT]: 'status_inpatient',
            [PatientStatus.EMERGENCY]: 'status_emergency',
        };
        return t(keyMap[status]);
    };


    const value = { locale, setLocale, isLocaleLoading, t, getTranslatedGender, getTranslatedProcedureType, getTranslatedAnesthesiaType, getTranslatedPatientStatus };
    
    return React.createElement(LocaleContext.Provider, { value }, children);
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};