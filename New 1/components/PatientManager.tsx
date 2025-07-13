import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useLocale } from '../hooks/useLocale';
import { Patient, Report, Gender, ProcedureType, EndoscopyImage, Assistant, AnesthesiaType, PatientStatus, BostonBowelPrepScale } from '../types';
import { Button, Input, Select, Card, Textarea, Modal, Spinner, ToggleSwitch } from './ui';
import { ICONS, REGIONS_BY_PROCEDURE, getReportTemplates } from '../constants';
import { getAIDiagnosis } from '../services/geminiService';
import { exportReportToPdf } from '../services/pdfService';
import { TranslationKeys } from '../i18n';

type View = 'LIST' | 'DETAIL' | 'EDITOR';

const PrintableReportComponent: React.FC<{reportData: {page1: string, page2: string}, patient: Patient, report: Report}> = ({reportData, patient, report}) => {
    const { getDoctor, getAssistant } = useData();
    const { t, getTranslatedGender, getTranslatedProcedureType, getTranslatedAnesthesiaType, getTranslatedPatientStatus } = useLocale();

    const endoscopist = report.endoscopistId ? getDoctor(report.endoscopistId) : null;
    const selectedAssistants = (report.assistantIds || [])
        .map(id => getAssistant(id))
        .filter((a): a is Assistant => a !== undefined);
    
    return (
        <div className="bg-gray-100 p-4">
            {/* Page 1: Report Content */}
            <div id={reportData.page1} className="relative bg-white p-6 font-sans text-sm text-gray-900 leading-normal w-[210mm] h-[297mm]">
                <header className="text-center border-b-2 border-black pb-2 mb-4">
                    <h1 className="text-2xl font-bold">{t('printable_report_title')}</h1>
                    <p className="text-gray-600">{t('printable_report_subtitle')}</p>
                </header>

                <section className="mb-4">
                    <h3 className="font-bold border-b border-black mb-2 pb-1 text-base">{t('printable_patient_info')}</h3>
                    <div className="flex flex-row justify-between items-center">
                        <span><strong>{t('printable_patient_name')}</strong> {patient.name}</span>
                        <span><strong>{t('printable_patient_age_gender')}</strong> {patient.age} / {getTranslatedGender(patient.gender)}</span>
                        <span><strong>{t('printable_patient_id')}</strong> {patient.id}</span>
                    </div>
                </section>

                <section className="mb-6">
                    <h3 className="font-bold border-b border-black mb-2 pb-1 text-base">{t('printable_procedure_details')}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        <span><strong>{t('printable_procedure')}</strong> {getTranslatedProcedureType(report.procedureType)}</span>
                        <span><strong>{t('printable_procedure_date')}</strong> {new Date(report.procedureDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                        <span><strong>{t('printable_endoscopist')}</strong> {endoscopist?.name || t('na')}</span>
                        <span><strong>{t('printable_assistants')}</strong> {selectedAssistants.length > 0 ? selectedAssistants.map(a => a.name).join(', ') : t('printable_none')}</span>
                        <span><strong>{t('printable_anesthetist_name')}</strong> {report.anesthetistName || t('na')}</span>
                        <span><strong>{t('printable_anesthesia_type')}</strong> {report.anesthesiaType ? getTranslatedAnesthesiaType(report.anesthesiaType) : t('na')}</span>
                        <span className="col-span-2"><strong>{t('printable_patient_status')}</strong> {report.patientStatus ? getTranslatedPatientStatus(report.patientStatus) : t('na')}</span>
                         {report.procedureType === ProcedureType.COLONOSCOPY && report.bostonBowelPrepScale && (
                            <span className="col-span-2"><strong>{t('bbps_title')}:</strong> {report.bostonBowelPrepScale.right} + {report.bostonBowelPrepScale.transverse} + {report.bostonBowelPrepScale.left} = <strong>{report.bostonBowelPrepScale.right + report.bostonBowelPrepScale.transverse + report.bostonBowelPrepScale.left}</strong></span>
                        )}
                    </div>
                </section>

                {report.consent && (
                    <section className="mb-6">
                        <h3 className="font-bold border-b border-black mb-2 pb-1 text-base">{t('printable_consent')}</h3>
                        <pre className="whitespace-pre-wrap font-sans text-sm">{report.consent}</pre>
                    </section>
                )}

                {report.indication && (
                     <section className="mb-6">
                        <h3 className="font-bold border-b border-black mb-2 pb-1 text-base">{t('printable_indication')}</h3>
                        <pre className="whitespace-pre-wrap font-sans text-sm">{report.indication}</pre>
                    </section>
                )}
                
                <div className="mt-6">
                    {report.findings && Object.values(report.findings).some(f => f && f.trim() !== '') && (
                        <section className="mb-6" style={{ pageBreakInside: 'avoid' }}>
                            <h3 className="font-bold border-b border-black mb-2 pb-1 text-base">{t('printable_detailed_findings')}</h3>
                            <div className="text-xs space-y-2 leading-tight">
                                {Object.entries(report.findings).filter(([, text]) => text && text.trim()).map(([regionKey, text]) => (
                                    <div key={regionKey}>
                                        <p className="font-bold">{t(`region_${regionKey}` as TranslationKeys)}:</p>
                                        <pre className="whitespace-pre-wrap font-sans pl-2">{text}</pre>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="mb-6">
                        <h3 className="font-bold border-b border-black mb-2 pb-1 text-base">{t('printable_impression_diagnosis')}</h3>
                        <pre className="whitespace-pre-wrap font-sans">{report.diagnosis}</pre>
                    </section>

                    {report.recommendation && (
                        <section className="mb-6">
                            <h3 className="font-bold border-b border-black mb-2 pb-1 text-base">{t('printable_recommendation')}</h3>
                            <pre className="whitespace-pre-wrap font-sans">{report.recommendation}</pre>
                        </section>
                    )}
                </div>

                <footer className="absolute bottom-6 left-6 right-6" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-end text-xs">
                        <div className="w-2/3">
                            <div className="border-t border-black pt-1">
                                <p className="font-semibold">{endoscopist?.name || t('printable_endoscopist_signature')}</p>
                                <p className="text-gray-600 dark:text-gray-400">{t('endoscopist')}</p>
                            </div>
                        </div>
                        <div className="text-right text-gray-600 dark:text-gray-400">
                            <p>{t('printable_report_completion_time')} {new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </footer>
            </div>
            
            {/* Page 2: Images */}
            {report.images && report.images.length > 0 && (
                 <div id={reportData.page2} className="bg-white p-4 font-sans text-gray-900 leading-normal w-[210mm] h-[297mm] mt-4">
                    <section>
                        <h3 className="font-bold border-b border-black mb-4 pb-1 text-base">{t('printable_endoscopic_images')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {report.images.map(image => (
                                <div key={image.id} className="border border-gray-300 p-1 flex flex-col" style={{ pageBreakInside: 'avoid' }}>
                                    <img src={image.imageDataUrl} alt={image.label} className="w-full h-auto rounded" />
                                    <p className="mt-1 text-xs text-center flex-shrink-0">
                                        <strong>{t(`region_${image.region}` as TranslationKeys)}:</strong> {image.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

const ReportEditor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { patientId, reportId } = useParams();
    const { getPatient, getReport, addReport, updateReport, settings, doctors, assistants } = useData();
    const { t, getTranslatedProcedureType, getTranslatedAnesthesiaType, getTranslatedPatientStatus } = useLocale();
    const navigate = useNavigate();

    const [patient, setPatient] = useState<Partial<Patient>>({});
    const [report, setReport] = useState<Partial<Report>>({});
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const reportIdForPdf = useMemo(() => ({
        page1: `printable-report-${report.id}-p1`,
        page2: `printable-report-${report.id}-p2`,
    }), [report.id]);


    useEffect(() => {
        setIsLoading(true);
        if (patientId === 'new' || !patientId) {
            navigate('/patients', { replace: true });
            return;
        }

        const existingPatient = getPatient(patientId);
        if (!existingPatient) {
            alert(t('patient_not_found'));
            navigate('/patients', { replace: true });
            return;
        }
        setPatient(existingPatient);
        
        const isNewReport = reportId === 'new';
        
        if (isNewReport) {
            const procedureType = ProcedureType.GASTROSCOPY;
            const template = getReportTemplates(t)[procedureType];
            const newReportTemplate: Partial<Report> = {
                procedureType,
                procedureDate: new Date().toISOString().split('T')[0],
                images: [],
                endoscopistId: doctors.length > 0 ? doctors[0].id : undefined,
                assistantIds: [],
                findings: {},
                anesthetistName: '',
                ...template,
            };
            setReport(newReportTemplate);
        } else {
            const existingReport = getReport(patientId, reportId!);
            if (existingReport) {
                let reportData = { ...existingReport };

                // Backwards compatibility for assistantId -> assistantIds
                if ((reportData as any).assistantId && !reportData.assistantIds) {
                    reportData.assistantIds = [(reportData as any).assistantId];
                }
                
                setReport(reportData);
            } else {
                alert(t('report_not_found'));
                navigate(`/patients/${patientId}`, {replace: true});
                return;
            }
        }
        setIsLoading(false);
    }, [patientId, reportId, getPatient, getReport, navigate, doctors, t]);

    const handleReportChange = <K extends keyof Report>(key: K, value: Report[K]) => {
        setReport(prev => ({...prev, [key]: value}));
        if(key === 'procedureType'){
            const template = getReportTemplates(t)[value as ProcedureType];
            setReport(prev => ({
                ...prev, 
                ...template,
                 findings: {}, // Clear findings for new procedure type
                 anesthetistName: '',
            }));
        }
    }
    
    const handleFindingChange = (regionKey: string, value: string) => {
        setReport(prev => ({
            ...prev,
            findings: {
                ...(prev.findings || {}),
                [regionKey]: value,
            }
        }));
    };

    const handleAssistantChange = (assistantId: string, checked: boolean) => {
        setReport(prev => {
            const currentIds = prev.assistantIds || [];
            if (checked) {
                return { ...prev, assistantIds: [...new Set([...currentIds, assistantId])] };
            } else {
                return { ...prev, assistantIds: currentIds.filter(id => id !== assistantId) };
            }
        });
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, region: string) => {
        if(e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage: EndoscopyImage = {
                    id: `IMG-${Date.now()}`,
                    region,
                    imageDataUrl: reader.result as string,
                    label: ''
                };
                setReport(prev => ({...prev, images: [...(prev.images || []), newImage]}));
            }
            reader.readAsDataURL(file);
        }
    }

    const updateImage = (imageId: string, data: Partial<EndoscopyImage>) => {
        setReport(prev => ({
            ...prev,
            images: prev.images?.map(img => img.id === imageId ? {...img, ...data} : img)
        }));
    }
    
    const removeImage = (imageId: string) => {
        setReport(prev => ({
            ...prev,
            images: prev.images?.filter(img => img.id !== imageId)
        }));
    }

    const handleAISuggestion = async (imageId: string) => {
        const image = report.images?.find(img => img.id === imageId);
        if(!image || !settings.aiEnabled) return;
        
        updateImage(imageId, { aiDiagnosis: 'loading' });
        
        try {
            const result = await getAIDiagnosis(image, t);
            updateImage(imageId, { aiDiagnosis: result.diagnosis });
        } catch (err) {
            updateImage(imageId, { aiDiagnosis: t('error') });
        }
    }
    
    const applyAISuggestion = (image: EndoscopyImage) => {
        if (!image.aiDiagnosis || image.aiDiagnosis === 'loading' || image.aiDiagnosis === t('error')) return;

        const regionKey = image.region;
        const currentFinding = report.findings?.[regionKey] || '';
        const newFinding = currentFinding ? `${currentFinding}\n- ${image.aiDiagnosis}` : image.aiDiagnosis;

        handleFindingChange(regionKey, newFinding);
    }

    const handleSave = () => {
        setIsSaving(true);
        setError('');

        const currentPatientId = patient.id;
        if (!currentPatientId) {
            setError(t('patient_id_error'));
            setIsSaving(false);
            return;
        }
        
        if (reportId === 'new') {
            const newReport = addReport(currentPatientId, report as Omit<Report, 'id'>);
            navigate(`/patients/${currentPatientId}/report/${newReport.id}`, { replace: true });
        } else {
            updateReport(currentPatientId, reportId!, report);
        }

        setIsSaving(false);
        alert(t('report_saved_success'));
    }
    
    const handleExportPdf = async () => {
        setIsReportModalOpen(true);
        
        setTimeout(async () => {
            try {
                const elementIds = [reportIdForPdf.page1];
                if (report.images && report.images.length > 0) {
                    elementIds.push(reportIdForPdf.page2);
                }
                await exportReportToPdf(elementIds, patient.name || 'Unknown');
            } catch (error) {
                console.error("PDF export failed", error);
                alert("Failed to export PDF.");
            } finally {
                setIsReportModalOpen(false);
            }
        }, 500); // Wait for modal to render content
    }
    
    const handleBBPSChange = (segment: keyof BostonBowelPrepScale, value: string) => {
        const score = parseInt(value, 10);
        if (!isNaN(score) && score >= 0 && score <= 3) {
            setReport(prev => ({
                ...prev,
                bostonBowelPrepScale: {
                    ...(prev.bostonBowelPrepScale || { right: 0, transverse: 0, left: 0 }),
                    [segment]: score,
                }
            }));
        }
    };

    if (isLoading || !report.procedureType) return <div className="flex justify-center items-center h-64"><Spinner/></div>;
    
    const regions = REGIONS_BY_PROCEDURE[report.procedureType as ProcedureType] || [];
    const bbps = report.bostonBowelPrepScale;
    const totalBBPScore = bbps ? bbps.right + bbps.transverse + bbps.left : 0;

    const renderFindingInput = (regionKey: string, rows: number = 3) => (
        <div key={regionKey}>
            <Textarea
                label={t(`region_${regionKey}` as TranslationKeys)}
                value={report.findings?.[regionKey] || ''}
                onChange={e => handleFindingChange(regionKey, e.target.value)}
                rows={rows}
            />
        </div>
    );

    return (
        <div>
            <Button onClick={onBack} variant="secondary" className="mb-4">{ICONS.back} {t('back')}</Button>
            
            <Card>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('procedure_details')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <Select label={t('procedure_type')} value={report.procedureType} onChange={e => handleReportChange('procedureType', e.target.value as ProcedureType)}>
                        {Object.values(ProcedureType).map(p => <option key={p} value={p}>{getTranslatedProcedureType(p)}</option>)}
                    </Select>
                    <Input label={t('procedure_date')} type="date" value={report.procedureDate?.split('T')[0] || ''} onChange={e => handleReportChange('procedureDate', e.target.value)} />
                    <Select label={t('endoscopist')} value={report.endoscopistId || ''} onChange={e => handleReportChange('endoscopistId', e.target.value)}>
                        <option value="">{t('select_endoscopist')}</option>
                        {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                    </Select>
                    <Input label={t('anesthetist_name')} value={report.anesthetistName || ''} onChange={e => handleReportChange('anesthetistName', e.target.value)} />
                    <Select label={t('anesthesia_type')} value={report.anesthesiaType || ''} onChange={e => handleReportChange('anesthesiaType', e.target.value as AnesthesiaType)}>
                         {Object.values(AnesthesiaType).map(at => <option key={at} value={at}>{getTranslatedAnesthesiaType(at)}</option>)}
                    </Select>
                    <Select label={t('patient_status')} value={report.patientStatus || ''} onChange={e => handleReportChange('patientStatus', e.target.value as PatientStatus)}>
                         {Object.values(PatientStatus).map(ps => <option key={ps} value={ps}>{getTranslatedPatientStatus(ps)}</option>)}
                    </Select>
                </div>
                 <div className="mb-6">
                     <Textarea 
                        label={t('consent')} 
                        value={report.consent || ''} 
                        onChange={e => handleReportChange('consent', e.target.value)} 
                        rows={3}
                    />
                 </div>
                 <div className="mb-6">
                    <Textarea 
                        label={t('indication')}
                        value={report.indication || ''}
                        onChange={e => handleReportChange('indication', e.target.value)}
                        rows={3}
                    />
                 </div>
                 <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">{t('assistants')}</h3>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {assistants.map(assistant => (
                                <label key={assistant.id} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-900"
                                        checked={(report.assistantIds || []).includes(assistant.id)}
                                        onChange={(e) => handleAssistantChange(assistant.id, e.target.checked)}
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">{assistant.name}</span>
                                </label>
                            ))}
                        </div>
                        {assistants.length === 0 && <p className="text-gray-500 dark:text-gray-400">{t('no_assistants_available')}</p>}
                    </div>
                </div>

                {report.procedureType === ProcedureType.COLONOSCOPY && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">{t('bbps_title')}</h3>
                        <Card className="p-4 bg-gray-50 dark:bg-gray-800/20">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <Select 
                                    label={t('bbps_right_colon')} 
                                    value={bbps?.right ?? '3'} 
                                    onChange={e => handleBBPSChange('right', e.target.value)}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </Select>
                                <Select 
                                    label={t('bbps_transverse_colon')}
                                    value={bbps?.transverse ?? '3'}
                                    onChange={e => handleBBPSChange('transverse', e.target.value)}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </Select>
                                <Select
                                    label={t('bbps_left_colon')}
                                    value={bbps?.left ?? '3'}
                                    onChange={e => handleBBPSChange('left', e.target.value)}
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </Select>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bbps_total_score')}</label>
                                    <p className="text-2xl font-bold p-2 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-md text-center">{totalBBPScore}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <p className="font-semibold">{t('bbps_instructions')}</p>
                                <p><span className="font-bold">3:</span> {t('bbps_score_3')}</p>
                                <p><span className="font-bold">2:</span> {t('bbps_score_2')}</p>
                                <p><span className="font-bold">1:</span> {t('bbps_score_1')}</p>
                                <p><span className="font-bold">0:</span> {t('bbps_score_0')}</p>
                            </div>
                        </Card>
                    </div>
                )}
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('detailed_findings')}</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/20">
                                {report.procedureType === ProcedureType.GASTROSCOPY ? (
                                    <div className="space-y-4">
                                        {renderFindingInput('esophagus')}
                                        {renderFindingInput('gej')}
                                        <div>
                                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">GASTRIC :</h4>
                                            <div className="pl-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-600 ml-2 py-2">
                                                {renderFindingInput('stomach_content', 2)}
                                                {renderFindingInput('stomach_fundus', 2)}
                                                {renderFindingInput('stomach_body', 2)}
                                                {renderFindingInput('stomach_antrum', 2)}
                                                {renderFindingInput('stomach_pylorus', 2)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">DUODENUM :</h4>
                                            <div className="pl-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-600 ml-2 py-2">
                                                {renderFindingInput('duodenum_bulb', 2)}
                                                {renderFindingInput('duodenum_second_part', 2)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    regions.map(regionKey => renderFindingInput(regionKey))
                                )}
                            </div>
                        </div>
                        <div>
                            <Textarea 
                                label={t('impression_diagnosis')} 
                                value={report.diagnosis || ''} 
                                onChange={e => handleReportChange('diagnosis', e.target.value)} 
                                rows={8}
                                className="min-h-[150px]"
                            />
                        </div>
                         <div>
                            <Textarea 
                                label={t('recommendation')}
                                value={report.recommendation || ''}
                                onChange={e => handleReportChange('recommendation', e.target.value)}
                                rows={4}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('images_by_region')}</h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 border dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800/20">
                            {regions.map(regionKey => (
                                <div key={regionKey} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                    <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">{t(`region_${regionKey}` as TranslationKeys)}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(report.images || []).filter(img => img.region === regionKey).map(image => (
                                            <div key={image.id} className="border dark:border-gray-600 rounded-lg p-2 space-y-2 shadow-sm bg-gray-50 dark:bg-gray-700">
                                                <img src={image.imageDataUrl} alt={image.label} className="w-full h-32 object-cover rounded"/>
                                                <Input value={image.label} onChange={e => updateImage(image.id, {label: e.target.value})} placeholder={t('image_label_placeholder')}/>
                                                <div className="flex gap-1">
                                                    <Button onClick={() => handleAISuggestion(image.id)} variant="secondary" className="w-full text-xs py-1 px-2" disabled={!settings.aiEnabled || image.aiDiagnosis === 'loading'} title={!settings.aiEnabled ? t('ai_disabled_tooltip') : t('get_ai_suggestion')}>{ICONS.ai} {image.aiDiagnosis === 'loading' ? <Spinner/> : t('ai_button')}</Button>
                                                    <Button onClick={() => removeImage(image.id)} variant="danger" className="w-full text-xs py-1 px-2">{ICONS.trash}</Button>
                                                </div>
                                                {image.aiDiagnosis && (
                                                    <div className="text-xs p-2 bg-gray-100 dark:bg-gray-700/50 rounded">
                                                        <p className="dark:text-gray-300"><b>{t('ai_dx_label')}</b> {image.aiDiagnosis === 'loading' ? t('ai_analyzing') : image.aiDiagnosis}</p>
                                                        {image.aiDiagnosis !== 'loading' && image.aiDiagnosis !== t('error') && <button onClick={() => applyAISuggestion(image)} className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-1">{t('apply')}</button>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                                                {ICONS.camera}
                                                <p className="text-sm">{t('add_image')}</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(e, regionKey)}/>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
                 
                 {error && <p className="text-red-500 mt-4">{error}</p>}

                 <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={handleExportPdf} variant="secondary">{ICONS.pdf} {t('export_pdf')}</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Spinner /> : t('save_report')}
                    </Button>
                 </div>
            </Card>
            
             <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title={t('generating_pdf')}>
                <div className="w-full h-full overflow-auto bg-gray-200">
                     <PrintableReportComponent reportData={reportIdForPdf} patient={patient as Patient} report={report as Report} />
                </div>
            </Modal>
        </div>
    );
};

const PatientDetail: React.FC<{ patient: Patient | undefined, onBack: () => void }> = ({ patient, onBack }) => {
    const navigate = useNavigate();
    const { deletePatient } = useData();
    const { t, getTranslatedGender, getTranslatedProcedureType } = useLocale();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    if (!patient) {
        return <div><p className="dark:text-white">{t('patient_not_found')}</p><Button onClick={onBack}>{t('back_to_list')}</Button></div>;
    }

    const handleDeleteConfirm = () => {
        deletePatient(patient.id);
        setIsDeleteModalOpen(false);
        onBack();
    };

    return (
        <div>
            <Button onClick={onBack} variant="secondary" className="mb-4">{ICONS.back} {t('back_to_list')}</Button>
            <Card className="mb-6">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{patient.name}</h2>
                        <div className="flex space-x-4 text-gray-600 dark:text-gray-400 mt-2">
                            <span>ID: {patient.id}</span>
                            <span>{t('age')}: {patient.age}</span>
                            <span>{t('gender')}: {getTranslatedGender(patient.gender)}</span>
                        </div>
                    </div>
                    <Button onClick={() => setIsDeleteModalOpen(true)} variant="danger">
                        {ICONS.trash} {t('delete_patient')}
                    </Button>
                </div>
            </Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('reports')}</h3>
                <Button onClick={() => navigate(`/patients/${patient.id}/report/new`)}>{ICONS.add} {t('new_report')}</Button>
            </div>
            <Card>
                {patient.reports.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {patient.reports.map(report => (
                            <li key={report.id} className="py-3 px-2 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold dark:text-gray-200">{getTranslatedProcedureType(report.procedureType)}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('date')}: {new Date(report.procedureDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })} &bull; {t('diagnosis')}: {report.diagnosis}</p>
                                </div>
                                <Button onClick={() => navigate(`/patients/${patient.id}/report/${report.id}`)} variant="secondary">{t('view_edit')}</Button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('no_reports_for_patient')}</p>}
            </Card>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('confirm_patient_deletion_title')}>
                <div className="text-center">
                    <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
                        {t('confirm_patient_deletion_message')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {t('confirm_patient_deletion_detail', { name: patient.name })}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>
                            {t('delete_patient')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const PatientManager: React.FC = () => {
    const { patientId, reportId } = useParams();
    const navigate = useNavigate();
    const { patients, getPatient } = useData();
    const { t, getTranslatedGender } = useLocale();
    const [view, setView] = useState<View>('LIST');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (patientId && reportId) {
            setView('EDITOR');
        } else if (patientId) {
            setView('DETAIL');
        } else {
            setView('LIST');
        }
    }, [patientId, reportId]);

    const filteredPatients = useMemo(() => 
        patients.filter(p => 
            (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.id || '').toLowerCase().includes(searchTerm.toLowerCase())
        ), 
    [patients, searchTerm]);

    const handleSelectPatient = (id: string) => {
        navigate(`/patients/${id}`);
    };
    
    const goBackToList = () => {
        navigate('/patients');
    };

    const goBackToDetail = () => {
        if (patientId) {
            navigate(`/patients/${patientId}`);
        } else {
            navigate('/patients');
        }
    };


    switch (view) {
        case 'DETAIL':
            return <PatientDetail patient={getPatient(patientId!)} onBack={goBackToList} />;
        case 'EDITOR':
            return <ReportEditor onBack={goBackToDetail} />;
        default:
            return (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('patients')}</h1>
                    </div>
                    <Card>
                        <Input 
                            placeholder={t('search_by_name_or_id')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="mb-4"
                        />
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredPatients.map(p => (
                                <li key={p.id} onClick={() => handleSelectPatient(p.id)} className="py-4 px-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md">
                                    <div>
                                        <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{p.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {p.id} &bull; {t('patient_list_item_age', {age: p.age})} &bull; {getTranslatedGender(p.gender)}</p>
                                    </div>
                                    <span className="text-sm bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-2 py-1 rounded-full">{t('patient_list_item_reports', {count: p.reports.length})}</span>
                                </li>
                            ))}
                        </ul>
                         {filteredPatients.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('no_patients_found')}</p>}
                    </Card>
                </div>
            );
    }
};

export default PatientManager;