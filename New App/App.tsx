

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useData } from './hooks/useData';
import { useLocale } from './hooks/useLocale';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientManager from './components/PatientManager';
import Settings from './components/Settings';
import AIGuidelineAssistant from './components/AIGuidelineAssistant';
import { ICONS } from './constants';
import { Button, Card, Select, Spinner } from './components/ui';
import { Patient, Report } from './types';
import { summarizeReport } from './services/geminiService';

const AIReportSummarizer: React.FC = () => {
    const { patients, settings } = useData();
    const { t, getTranslatedProcedureType } = useLocale();

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedReportId, setSelectedReportId] = useState<string>('');
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    const reportsForPatient = selectedPatient?.reports || [];
    const selectedReport = reportsForPatient.find(r => r.id === selectedReportId);

    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPatientId(e.target.value);
        setSelectedReportId('');
        setSummary('');
        setError('');
    };
    
    const handleReportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedReportId(e.target.value);
        setSummary('');
        setError('');
    };

    const handleGenerateSummary = async () => {
        if (!selectedPatient || !selectedReport) return;
        
        setIsLoading(true);
        setError('');
        setSummary('');

        try {
            const result = await summarizeReport(selectedPatient, selectedReport, t);
            setSummary(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('tools_ai_summarizer_title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('tools_ai_summarizer_desc')}</p>
            
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Select label={t('select_patient')} value={selectedPatientId} onChange={handlePatientChange} disabled={!settings.aiEnabled}>
                        <option value="">{t('select_patient_placeholder')}</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
                    </Select>
                    
                    <Select label={t('select_report')} value={selectedReportId} onChange={handleReportChange} disabled={!selectedPatient || !settings.aiEnabled}>
                        <option value="">{t('select_report_placeholder')}</option>
                        {reportsForPatient.map(r => (
                            <option key={r.id} value={r.id}>
                                {getTranslatedProcedureType(r.procedureType)} - {new Date(r.procedureDate).toLocaleDateString()}
                            </option>
                        ))}
                    </Select>

                    <Button 
                        onClick={handleGenerateSummary} 
                        disabled={!selectedReport || isLoading || !settings.aiEnabled}
                    >
                        {isLoading ? <Spinner /> : t('generate_summary_button')}
                    </Button>
                </div>
                {!settings.aiEnabled && <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-4">{t('ai_disabled_tooltip')}</p>}
            </Card>

            {error && <Card className="mt-6 bg-red-50 dark:bg-red-900/20"><p className="text-red-600 dark:text-red-400">{error}</p></Card>}

            {summary && (
                <Card className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('clinical_summary_title')}</h2>
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">{summary}</pre>
                </Card>
            )}
        </div>
    );
};

const ToolsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLocale();

    const tools = [
        {
            name: t('tools_ai_summarizer_title'),
            description: t('tools_ai_summarizer_desc'),
            path: '/tools/ai-report-summarizer',
            icon: ICONS.ai,
        },
        {
            name: t('tools_ai_guideline_assistant_title'),
            description: t('tools_ai_guideline_assistant_desc'),
            path: '/tools/ai-guideline-assistant',
            icon: ICONS.guidelines,
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('tools')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <Card
                        key={tool.name}
                        className="cursor-pointer hover:shadow-lg hover:border-indigo-500 border-2 border-transparent transition-all duration-200"
                        onClick={() => navigate(tool.path)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg text-indigo-600 dark:text-indigo-300">
                                {tool.icon}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{tool.name}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};


const MainApp: React.FC = () => {
    const { logout } = useData();
    const { t } = useLocale();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { to: "/", label: t('dashboard'), icon: ICONS.dashboard },
        { to: "/patients", label: t('patients'), icon: ICONS.patients },
        { to: "/tools", label: t('tools'), icon: ICONS.tools },
        { to: "/settings", label: t('settings'), icon: ICONS.settings },
    ];
    
    const activeLinkClass = "bg-indigo-700 text-white";
    const inactiveLinkClass = "text-indigo-100 hover:bg-indigo-500 hover:text-white";

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <div className="w-64 bg-indigo-600 dark:bg-gray-800 text-white flex flex-col flex-shrink-0">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold">{t('app_title')}</h1>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map(item => (
                         <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive ? activeLinkClass : inactiveLinkClass
                                }`
                            }
                        >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-indigo-500 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${inactiveLinkClass}`}
                    >
                        {ICONS.logout}
                        <span className="ml-3">{t('logout')}</span>
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/patients" element={<PatientManager />} />
                    <Route path="/patients/:patientId" element={<PatientManager />} />
                    <Route path="/patients/:patientId/report/:reportId" element={<PatientManager />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/tools" element={<ToolsPage />} />
                    <Route path="/tools/ai-report-summarizer" element={<AIReportSummarizer />} />
                    <Route path="/tools/ai-guideline-assistant" element={<AIGuidelineAssistant />} />
                </Routes>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    const { isAuthenticated, settings, isDataLoading } = useData();
    const { isLocaleLoading } = useLocale();

    useEffect(() => {
        if (!isDataLoading && !isLocaleLoading) {
            const loader = document.getElementById('initial-loader');
            if (loader) {
                loader.style.display = 'none';
            }
        }
    }, [isDataLoading, isLocaleLoading]);
    
    useEffect(() => {
        const root = window.document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings.theme]);

    if (isDataLoading || isLocaleLoading) {
        return null; // The initial loader is shown via HTML/CSS until loading is complete
    }

    return (
        <HashRouter>
            {isAuthenticated ? <MainApp /> : <Login />}
        </HashRouter>
    );
};

export default App;
