import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResults from './components/AnalysisResults';
import { HeaderIcon, GithubIcon } from './components/icons';
import { analyzeLesionImage } from './services/geminiService';
import { AnalysisResult } from './types';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (supportedTypes.includes(file.type)) {
        handleClear();
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        setError(null);
      } else {
        setError(`Unsupported file type: ${file.type}. Please upload a PNG, JPG, GIF, or WEBP.`);
      }
    }
  };

  const handleAdditionalInfoChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInfo(event.target.value);
  };
  
  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const result = await analyzeLesionImage(imagePart, additionalInfo);
      setAnalysisResult(result);
    } catch (e: any) {
      console.error(e);
      setError(`An error occurred during analysis: ${e.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, additionalInfo]);

  const handleClear = useCallback(() => {
    setImageFile(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setAdditionalInfo('');
    setAnalysisResult(null);
    setIsLoading(false);
    setError(null);
    
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <HeaderIcon />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-700 tracking-tight">
                GI Lesion Analysis Assistant
              </h1>
            </div>
            <a href="https://github.com/seyha-dev/gemini-pro-vision-react" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 transition-colors">
              <GithubIcon />
            </a>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <ImageUploader 
            onImageChange={handleImageChange} 
            imageUrl={imageUrl}
            isLoading={isLoading}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            additionalInfo={additionalInfo}
            onAdditionalInfoChange={handleAdditionalInfoChange}
          />
          <AnalysisResults result={analysisResult} isLoading={isLoading} />
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>This tool is for informational purposes only and not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}

export default App;