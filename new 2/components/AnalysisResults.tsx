import React from 'react';
import { AnalysisResult } from '../types';
import ClassificationCard from './ClassificationCard';
import Spinner from './Spinner';
import { ChartBarIcon, DocumentTextIcon, LightBulbIcon, SparklesIcon, ScaleIcon, BeakerIcon, VesselIcon, TagIcon, MapPinIcon, InformationCircleIcon } from './icons';

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-16 bg-slate-200 rounded-lg"></div>
            <div className="h-16 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-24 bg-slate-200 rounded-lg"></div>
        <div className="h-8 bg-slate-200 rounded-md w-1/2 mt-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-28 bg-slate-200 rounded-lg"></div>
            <div className="h-28 bg-slate-200 rounded-lg"></div>
            <div className="h-28 bg-slate-200 rounded-lg"></div>
            <div className="h-28 bg-slate-200 rounded-lg"></div>
        </div>
    </div>
);

const getIconForSystem = (system: string) => {
    const s = system.toLowerCase();
    if (s.includes('paris')) return ChartBarIcon;
    if (s.includes('nice')) return BeakerIcon;
    if (s.includes('jnet')) return SparklesIcon;
    if (s.includes('kudo')) return ScaleIcon;
    if (s.includes('sano')) return VesselIcon;
    if (s.includes('ipcl')) return VesselIcon;
    if (s.includes('forrest')) return DocumentTextIcon;
    if (s.includes('prague')) return ChartBarIcon;
    if (s.includes('vienna')) return BeakerIcon;
    if (s.includes('kimura')) return SparklesIcon;
    if (s.includes('los angeles')) return ChartBarIcon;
    return DocumentTextIcon;
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
       <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
          <DocumentTextIcon className="w-6 h-6 mr-2 text-green-500" />
          AI Analysis Report
        </h2>

      {isLoading && <SkeletonLoader />}
      
      {!isLoading && !result && (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-slate-50 rounded-lg">
            <SparklesIcon className="w-16 h-16 text-slate-400" />
            <p className="mt-4 text-lg font-medium text-slate-600">Awaiting Analysis</p>
            <p className="mt-1 text-sm text-slate-500">Upload an image and click "Analyze Lesion" to see results.</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg flex items-center space-x-3">
                    <TagIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                    <p className="text-sm font-medium text-slate-500">Lesion Type</p>
                    <p className="text-lg font-semibold text-slate-800">{result.lesionType}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg flex items-center space-x-3">
                    <MapPinIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                    <p className="text-sm font-medium text-slate-500">Location</p>
                    <p className="text-lg font-semibold text-slate-800">{result.location}</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-800 text-md flex items-center mb-2">
                    <InformationCircleIcon className="w-5 h-5 mr-2 text-slate-500" />
                    Detailed Description
                </h3>
                <p className="text-slate-600 text-sm">{result.detailedDescription}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-600 mb-3">Classification Details</h3>
                {result.classifications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.classifications.map((c, index) => (
                            <ClassificationCard 
                                key={index}
                                title={c.system} 
                                value={c.value} 
                                Icon={getIconForSystem(c.system)} 
                                description={c.description} 
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm bg-slate-100 p-4 rounded-md">No specific classifications were applied.</p>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-800 text-md flex items-center mb-2">
                    <LightBulbIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Histology Prediction
                </h3>
                <p className="text-blue-800 text-lg font-medium">{result.histologyPrediction}</p>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${result.confidenceScore}%` }}></div>
                </div>
                <p className="text-xs text-slate-600 mt-1">Confidence: {result.confidenceScore}%</p>
                <p className="text-sm text-slate-600 mt-2 italic">"{result.explanation}"</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-800 text-md flex items-center mb-2">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-green-600" />
                    Recommended Management
                </h3>
                <p className="text-green-800 text-lg font-medium">{result.managementRecommendation}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;