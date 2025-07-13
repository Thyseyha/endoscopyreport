import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useLocale } from '../hooks/useLocale';
import { Button, Card, Select, Spinner, Input, Textarea } from './ui';
import { Gender, ProcedureType, GuidelineRegion } from '../types';
import { getAIGuidelines } from '../services/geminiService';
import { TranslationKeys } from '../i18n';

const AIGuidelineAssistant: React.FC = () => {
    const { settings } = useData();
    const { t, getTranslatedProcedureType, getTranslatedGender } = useLocale();

    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<Gender>(Gender.MALE);
    const [procedureType, setProcedureType] = useState<ProcedureType>(ProcedureType.GASTROSCOPY);
    
    const [guidelines, setGuidelines] = useState<GuidelineRegion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateGuidelines = async () => {
        if (!age) {
            setError(t('form_error_required_fields'));
            return;
        }
        
        setIsLoading(true);
        setError('');
        setGuidelines([]);

        try {
            const result = await getAIGuidelines(parseInt(age, 10), gender, procedureType, t);
            if (result.guidelines) {
                 setGuidelines(result.guidelines);
            } else {
                setError(t('error'));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindingChange = (regionIndex: number, findingIndex: number, field: 'name' | 'details', value: string) => {
        const newGuidelines = [...guidelines];
        newGuidelines[regionIndex].findings[findingIndex] = {
            ...newGuidelines[regionIndex].findings[findingIndex],
            [field]: value
        };
        setGuidelines(newGuidelines);
    };
    
    const handleCopyToClipboard = () => {
        const textToCopy = guidelines.map(region => {
            const regionName = t(`region_${region.region}` as TranslationKeys);
            const findingsText = region.findings.map(finding => 
                `${finding.name}\n${finding.details}`
            ).join('\n\n');
            return `### ${regionName} ###\n${findingsText}`;
        }).join('\n\n-----------------\n\n');

        navigator.clipboard.writeText(textToCopy)
            .then(() => alert(t('copied_to_clipboard')))
            .catch(err => {
                console.error('Copy failed', err);
                alert(t('copy_failed'));
            });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('tools_ai_guideline_assistant_title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('tools_ai_guideline_assistant_desc')}</p>
            
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <Input label={t('age')} type="number" value={age} onChange={e => setAge(e.target.value)} placeholder={t('age_placeholder')} disabled={!settings.aiEnabled} min="0"/>

                    <Select label={t('gender')} value={gender} onChange={e => setGender(e.target.value as Gender)} disabled={!settings.aiEnabled}>
                        {Object.values(Gender).map(g => <option key={g} value={g}>{getTranslatedGender(g)}</option>)}
                    </Select>
                    
                    <Select label={t('procedure_type')} value={procedureType} onChange={e => setProcedureType(e.target.value as ProcedureType)} disabled={!settings.aiEnabled}>
                         {Object.values(ProcedureType).map(p => <option key={p} value={p}>{getTranslatedProcedureType(p)}</option>)}
                    </Select>

                    <Button 
                        onClick={handleGenerateGuidelines} 
                        disabled={isLoading || !settings.aiEnabled}
                    >
                        {isLoading ? <Spinner /> : t('generate_guidelines_button')}
                    </Button>
                </div>
                {!settings.aiEnabled && <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-4">{t('ai_disabled_tooltip')}</p>}
            </Card>

            {error && <Card className="mb-6 bg-red-50 dark:bg-red-900/20"><p className="text-red-600 dark:text-red-400">{error}</p></Card>}

            {guidelines.length > 0 && (
                <Card>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('guideline_recommendations_title')}</h2>
                        <Button onClick={handleCopyToClipboard} variant="secondary">
                            {t('copy_to_clipboard')}
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {guidelines.map((region, regionIndex) => (
                            <div key={region.region} className="p-4 border rounded-lg dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3">{t(`region_${region.region}` as TranslationKeys)}</h3>
                                <div className="space-y-4">
                                    {region.findings.map((finding, findingIndex) => (
                                        <div key={findingIndex} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                            <Input
                                                label={t('finding_name')}
                                                value={finding.name}
                                                onChange={e => handleFindingChange(regionIndex, findingIndex, 'name', e.target.value)}
                                                className="mb-2 font-semibold"
                                            />
                                            <Textarea
                                                label={t('finding_details')}
                                                value={finding.details}
                                                onChange={e => handleFindingChange(regionIndex, findingIndex, 'details', e.target.value)}
                                                rows={4}
                                            />
                                        </div>
                                    ))}
                                    {region.findings.length === 0 && <p className="text-gray-500 dark:text-gray-400">{t('no_guidelines_for_region')}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AIGuidelineAssistant;