

import React, { useState, useEffect, useRef } from 'react';

interface ExportControlsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportPhoto: () => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({ onExportPDF, onExportExcel, onExportPhoto }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left w-full sm:w-auto" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="w-full sm:w-auto inline-flex justify-center items-center rounded-md border border-slate-600 shadow-sm px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-700 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={toggleDropdown}
        >
          Export Options
          <svg className="-mr-1 ml-2 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-full sm:w-56 rounded-md shadow-lg bg-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => { onExportPDF(); setIsOpen(false); }}
              className="w-full text-left block px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-200 hover:bg-slate-600 hover:text-white"
              role="menuitem"
              aria-label="Export as PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2 align-text-bottom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as PDF
            </button>
            <button
              onClick={() => { onExportExcel(); setIsOpen(false); }}
              className="w-full text-left block px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-200 hover:bg-slate-600 hover:text-white"
              role="menuitem"
              aria-label="Export as Excel"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2 align-text-bottom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export as Excel
            </button>
            <button
              onClick={() => { onExportPhoto(); setIsOpen(false); }}
              className="w-full text-left block px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-200 hover:bg-slate-600 hover:text-white"
              role="menuitem"
              aria-label="Export as Photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2 align-text-bottom" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Export as Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportControls;