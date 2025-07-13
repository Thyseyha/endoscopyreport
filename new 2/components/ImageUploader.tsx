import React from 'react';
import Spinner from './Spinner';
import { UploadIcon, AnalyzeIcon, ClearIcon, MicroscopeIcon, ClipboardIcon } from './icons';

interface ImageUploaderProps {
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imageUrl: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onClear: () => void;
  additionalInfo: string;
  onAdditionalInfoChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, imageUrl, isLoading, onAnalyze, onClear, additionalInfo, onAdditionalInfoChange }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
        <MicroscopeIcon className="w-6 h-6 mr-2 text-blue-500" />
        Lesion Image Input
      </h2>
      <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 min-h-[300px]">
        {imageUrl ? (
          <div className="relative w-full h-full">
            <img src={imageUrl} alt="Lesion preview" className="w-full h-full object-contain rounded-md" />
          </div>
        ) : (
          <div className="text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              <label htmlFor="file-upload" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                Upload an image
              </label>
            </p>
            <p className="text-xs text-slate-500">PNG, JPG, GIF, WEBP</p>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <label htmlFor="additional-info" className="flex items-center text-sm font-medium text-slate-700 mb-2">
            <ClipboardIcon className="w-5 h-5 mr-2 text-slate-500" />
            Additional Clinical Information (Optional)
        </label>
        <textarea
          id="additional-info"
          name="additional-info"
          rows={3}
          className="w-full px-3 py-2 text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
          placeholder="e.g., Lesion size 20mm, located in gastric antrum, patient has history of H. pylori..."
          value={additionalInfo}
          onChange={onAdditionalInfoChange}
          disabled={isLoading}
          aria-describedby="additional-info-description"
        />
        <p id="additional-info-description" className="mt-2 text-xs text-slate-500">
            Provide any relevant details that might help the AI provide a more accurate analysis.
        </p>
      </div>


      <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onAnalyze}
          disabled={!imageUrl || isLoading}
          className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Spinner />
              Analyzing...
            </>
          ) : (
            <>
              <AnalyzeIcon className="w-5 h-5 mr-2" />
              Analyze Lesion
            </>
          )}
        </button>
        <button
          onClick={onClear}
          disabled={!imageUrl || isLoading}
          className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ClearIcon className="w-5 h-5 mr-2" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;