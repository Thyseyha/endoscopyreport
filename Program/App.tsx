

import React, { useState, useEffect, useCallback } from 'react';
import ScheduleTable from './components/ScheduleTable.js';
import ImageModal from './components/ImageModal.js';
import ExportControls from './components/ExportControls.js';
import { PatientScheduleEntry } from './types.js';

// Declare global libraries for TypeScript
declare var jsPDF: any; // from jspdf.umd.min.js
declare var XLSX: any; // from xlsx.full.min.js
declare var html2canvas: any; // from html2canvas.min.js

// Helper to generate a unique ID for new patients
const generateNewPatientId = (): string => {
  return `PAT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Helper to create a new, empty patient entry
const createInitialPatientEntry = (initialDate: string | null = null): PatientScheduleEntry => ({
  id: generateNewPatientId(),
  name: '', // Single name field
  sex: '',
  age: '',
  date: initialDate,
  operator: '', // Initialize operator
  uploadedImages: [], // Initialize uploadedImages as an array
});


const App: React.FC = () => {
  const [monthlySchedules, setMonthlySchedules] = useState<PatientScheduleEntry[][]>(Array(12).fill([]));
  const [minimizedStates, setMinimizedStates] = useState<boolean[]>(Array(12).fill(true)); // Initialize all tables as minimized
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false); // State for fullscreen

  // State for Image Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const monthsConfig = [
    { value: 0, label: 'January' }, { value: 1, label: 'February' },
    { value: 2, label: 'March' }, { value: 3, label: 'April' },
    { value: 4, label: 'May' }, { value: 5, label: 'June' },
    { value: 6, label: 'July' }, { value: 7, label: 'August' },
    { value: 8, label: 'September' }, { value: 9, label: 'October' },
    { value: 10, label: 'November' }, { value: 11, label: 'December' },
  ];

  // Initialize each month with one patient entry and set minimized states when year changes
  useEffect(() => {
    const allMonthsData: PatientScheduleEntry[][] = [];
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      allMonthsData.push([createInitialPatientEntry(null)]);
    }
    setMonthlySchedules(allMonthsData);
    setMinimizedStates(Array(12).fill(true)); // Ensure tables are minimized on year change
  }, [selectedYear]);

  const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleDateChange = (monthIndex: number, patientId: string, newDate: string) => {
    setMonthlySchedules(prevSchedules =>
      prevSchedules.map((monthSchedule, mIndex) =>
        mIndex === monthIndex
          ? monthSchedule.map(p => (p.id === patientId ? { ...p, date: newDate } : p))
          : monthSchedule
      )
    );
  };

  const handleSexChange = (monthIndex: number, patientId: string, newSex: 'M' | 'F' | '') => {
    setMonthlySchedules(prevSchedules =>
      prevSchedules.map((monthSchedule, mIndex) =>
        mIndex === monthIndex
          ? monthSchedule.map(p => (p.id === patientId ? { ...p, sex: newSex } : p))
          : monthSchedule
      )
    );
  };

  const handleAgeChange = (monthIndex: number, patientId: string, newAge: string) => {
    setMonthlySchedules(prevSchedules =>
      prevSchedules.map((monthSchedule, mIndex) =>
        mIndex === monthIndex
          ? monthSchedule.map(p => (p.id === patientId ? { ...p, age: newAge } : p))
          : monthSchedule
      )
    );
  };

  const handleNameChange = (monthIndex: number, patientId: string, newName: string) => {
    setMonthlySchedules(prevSchedules =>
      prevSchedules.map((monthSchedule, mIndex) =>
        mIndex === monthIndex
          ? monthSchedule.map(p => (p.id === patientId ? { ...p, name: newName } : p))
          : monthSchedule
      )
    );
  };

  const handleOperatorChange = (monthIndex: number, patientId: string, newOperator: string) => {
    setMonthlySchedules(prevSchedules =>
      prevSchedules.map((monthSchedule, mIndex) =>
        mIndex === monthIndex
          ? monthSchedule.map(p => (p.id === patientId ? { ...p, operator: newOperator } : p))
          : monthSchedule
      )
    );
  };

  const handleImageUpload = (monthIndex: number, patientId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64Image = loadEvent.target?.result as string;
        setMonthlySchedules(prevSchedules =>
          prevSchedules.map((monthSchedule, mIndex) =>
            mIndex === monthIndex
              ? monthSchedule.map(p => {
                  if (p.id === patientId) {
                    const updatedImages = p.uploadedImages ? [...p.uploadedImages, base64Image] : [base64Image];
                    return { ...p, uploadedImages: updatedImages };
                  }
                  return p;
                })
              : monthSchedule
          )
        );
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Clear the file input
  };

  const handleRemoveImage = (monthIndex: number, patientId: string, imageIndexToRemove: number) => {
    setMonthlySchedules(prevSchedules =>
      prevSchedules.map((monthSchedule, mIndex) =>
        mIndex === monthIndex
          ? monthSchedule.map(p => {
              if (p.id === patientId) {
                const updatedImages = p.uploadedImages?.filter((_, index) => index !== imageIndexToRemove);
                return { ...p, uploadedImages: updatedImages };
              }
              return p;
            })
          : monthSchedule
      )
    );
  };

  const handleAddPatient = (monthIndex: number) => {
    const newPatient = createInitialPatientEntry(null); 
    setMonthlySchedules(prevSchedules =>
      prevSchedules.map((monthSchedule, mIndex) =>
        mIndex === monthIndex
          ? [...monthSchedule, newPatient]
          : monthSchedule
      )
    );
  };

  const handleRemovePatient = (monthIndex: number, patientId: string) => {
    setMonthlySchedules(prevSchedules =>
      prevSchedules.map((monthSchedule, mIndex) =>
        mIndex === monthIndex
          ? monthSchedule.filter(p => p.id !== patientId)
          : monthSchedule
      )
    );
  };

  const toggleTableMinimize = (monthIndex: number) => {
    setMinimizedStates(prevStates =>
      prevStates.map((state, index) => (index === monthIndex ? !state : state))
    );
  };

  const allTablesMinimized = minimizedStates.every(state => state === true);

  const handleToggleAllMinimized = () => {
    if (allTablesMinimized) {
      setMinimizedStates(Array(12).fill(false)); 
    } else {
      setMinimizedStates(Array(12).fill(true)); 
    }
  };

  // Image Modal Handlers
  const handleOpenImageModal = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  const years = [2024, 2025, 2026, 2027, 2028]; 

  // Filter schedules based on search query
  const filteredMonthlySchedules = monthlySchedules.map(monthSchedule => {
    if (!searchQuery.trim()) {
      return monthSchedule; // No search query, return original schedule for the month
    }
    return monthSchedule.filter(patient =>
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalFilteredPatients = filteredMonthlySchedules.reduce((acc, month) => acc + month.length, 0);
  const hasInitialData = monthlySchedules.some(monthSchedule => monthSchedule.length > 0);

  const getTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF.jsPDF({ orientation: 'landscape' });
    const exportTimestamp = getTimestamp();
    const headers = ['#', 'Patient Name', 'Age', 'Sex', 'Procedure Date', 'Operator']; // Add other relevant headers if needed
    let firstPage = true;

    doc.setFontSize(18);
    doc.text(`Endoscopy Schedule - ${selectedYear}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 22);

    filteredMonthlySchedules.forEach((monthSchedule, monthIndex) => {
      if (monthSchedule.length > 0) {
        if (!firstPage) {
          doc.addPage();
        }
        firstPage = false;
        
        const monthName = monthsConfig[monthIndex].label;
        doc.setFontSize(14);
        doc.text(`${monthName} ${selectedYear} Schedule`, 14, firstPage ? 30 : 20);

        const body = monthSchedule.map((patient, index) => [
          index + 1,
          patient.name || '',
          patient.age || '',
          patient.sex || '',
          patient.date || '',
          patient.operator || ''
          // Add other patient data corresponding to headers
        ]);

        (doc as any).autoTable({
          startY: firstPage ? 35 : 25,
          head: [headers],
          body: body,
          theme: 'striped',
          headStyles: { fillColor: [30, 41, 59] }, // slate-800
          styles: { fontSize: 8, cellPadding: 1.5 },
          columnStyles: {
            0: { cellWidth: 10 }, // #
            1: { cellWidth: 'auto' }, // Patient Name
            2: { cellWidth: 15 }, // Age
            3: { cellWidth: 15 }, // Sex
            4: { cellWidth: 30 }, // Date
            5: { cellWidth: 'auto' }, // Operator
            // Define other column widths
          }
        });
      }
    });
    doc.save(`Endoscopy_Schedule_${selectedYear}_${exportTimestamp}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const exportTimestamp = getTimestamp();
    const headers = ['#', 'Patient Name', 'Age', 'Sex', 'Procedure Date', 'Operator']; // Add other relevant headers

    filteredMonthlySchedules.forEach((monthSchedule, monthIndex) => {
      if (monthSchedule.length > 0) {
        const monthName = monthsConfig[monthIndex].label;
        const ws_data = [
          headers,
          ...monthSchedule.map((patient, index) => [
            index + 1,
            patient.name || '',
            patient.age || '',
            patient.sex || '',
            patient.date || '',
            patient.operator || ''
            // Add other patient data
          ])
        ];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        
        ws['!cols'] = [
          {wch: 5}, {wch: 30}, {wch: 8}, {wch: 8}, {wch: 15}, {wch: 30} // Adjust widths as needed
        ];

        XLSX.utils.book_append_sheet(wb, ws, monthName.substring(0, 31));
      }
    });

    if (wb.SheetNames.length > 0) {
      XLSX.writeFile(wb, `Endoscopy_Schedule_${selectedYear}_${exportTimestamp}.xlsx`);
    } else {
      alert("No data available to export for the selected filters and year.");
    }
  };

  const handleExportPhoto = () => {
    const mainContentElement = document.getElementById('schedule-main-content');
    if (mainContentElement) {
      const originalBodyBg = document.body.style.backgroundColor;
      document.body.style.backgroundColor = '#0f172a'; 

      html2canvas(mainContentElement, { 
        allowTaint: true, 
        useCORS: true,
        backgroundColor: '#0f172a',
         onclone: (documentClone: Document) => { 
            // Hide scrollbars more aggressively for screenshot
            const newStyle = documentClone.createElement('style');
            newStyle.innerHTML = `
              body, html { overflow: hidden !important; }
              ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
              * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
            `;
            documentClone.head.appendChild(newStyle);
            // If tables are minimized, expand them for the screenshot for a better photo export.
            // This is a complex change for a photo, for now, it captures what's visible.
        }
      }).then((canvas: HTMLCanvasElement) => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `Endoscopy_Schedule_Photo_${getTimestamp()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.body.style.backgroundColor = originalBodyBg;
      }).catch((error: any) => {
        console.error("Error exporting as photo:", error);
        alert("Sorry, there was an error exporting the schedule as a photo.");
        document.body.style.backgroundColor = originalBodyBg;
      });
    } else {
      console.error("Main content element not found for photo export.");
      alert("Could not find the main content area to capture for the photo export.");
    }
  };

  const toggleFullscreen = async () => {
    const docEl = document.documentElement as any;
    const doc = document as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
      // Enter fullscreen
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) { /* Safari */
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) { /* Firefox */
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) { /* IE/Edge */
        await docEl.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) { /* Safari */
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) { /* Firefox */
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) { /* IE/Edge */
        await doc.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);    // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);    // IE/Edge

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);


  return (
    <div 
      className={`min-h-screen text-slate-100 flex flex-col items-center ${isFullscreen ? 'p-0' : 'p-2 sm:p-3 md:p-4'}`}
      style={{
        backgroundImage: 'url("https://storage.googleapis.com/fab%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A8%D8%A9/040a43f8-8547-4952-b892-23fcf93f9c6c.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <header className="mb-2 sm:mb-3 text-center w-full max-w-7xl bg-slate-900/75 p-2 sm:p-3 md:p-4 rounded-xl shadow-2xl"> {/* Reduced margin and padding */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300"> {/* Reduced font size */}
          ENDOSCOPY SCHEDULE
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto"> {/* Reduced margin and font size */}
          Annual overview of scheduled ERCP, EUS and Cholangioscopy procedures.
        </p>
      </header>
      
      <div className="mb-2 sm:mb-3 flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-2 md:gap-3 w-full max-w-7xl px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-800 shadow-md rounded-lg border border-slate-700"> {/* Reduced margin, padding, gap */}
        <div className="flex-grow lg:flex-grow-0 lg:w-1/4">
          <label htmlFor="year-select" className="block text-xs font-medium text-slate-300 mb-0.5">Year:</label> {/* Reduced font size and margin */}
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500" // Reduced padding and font size
            aria-label="Select year"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex-grow lg:flex-grow-0 lg:w-2/4">
          <label htmlFor="search-patient" className="block text-xs font-medium text-slate-300 mb-0.5">Search Patient by Name:</label> {/* Reduced font size and margin */}
          <input
            type="text"
            id="search-patient"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            placeholder="Enter patient name..."
            className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500" // Reduced padding and font size
            aria-label="Search patient by name"
          />
        </div>
        <div className="flex-grow-0 lg:w-auto flex flex-col sm:flex-row gap-1.5 sm:gap-2 lg:items-end"> {/* Reduced gap */}
            <ExportControls onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} onExportPhoto={handleExportPhoto} />
            <button
                onClick={handleToggleAllMinimized}
                className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors whitespace-nowrap" // Reduced padding and font size
                aria-live="polite"
            >
                {allTablesMinimized ? 'Expand All' : 'Minimize All'}
                <span className="ml-1" aria-hidden="true">{allTablesMinimized ? '►' : '▼'}</span> {/* Reduced margin */}
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors whitespace-nowrap flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen (Press ESC)" : "Enter Fullscreen"}
              aria-live="polite"
            >
              {isFullscreen ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m7 2l5-5m0 0h-4m4 0v4m-11 5l-5 5m0 0v-4m0 4h4m7-2l5 5m0 0v-4m0 4h-4" />
                  </svg>
                  Enter Fullscreen
                </>
              )}
            </button>
        </div>
      </div>

      <main 
        id="schedule-main-content" 
        className={`w-full flex flex-col items-center ${isFullscreen ? 'space-y-0 mt-0' : 'space-y-2 sm:space-y-3'}`}
      >
        {filteredMonthlySchedules.map((monthData, monthIndex) => (
          <ScheduleTable
            key={`${selectedYear}-${monthsConfig[monthIndex].label}`}
            monthName={monthsConfig[monthIndex].label}
            patients={monthData}
            numOtherColumns={8} 
            onDateChange={(patientId, newDate) => handleDateChange(monthIndex, patientId, newDate)}
            onSexChange={(patientId, newSex) => handleSexChange(monthIndex, patientId, newSex)}
            onAgeChange={(patientId, newAge) => handleAgeChange(monthIndex, patientId, newAge)}
            onNameChange={(patientId, newName) => handleNameChange(monthIndex, patientId, newName)}
            onOperatorChange={(patientId, newOperator) => handleOperatorChange(monthIndex, patientId, newOperator)}
            onImageUpload={(patientId, event) => handleImageUpload(monthIndex, patientId, event)}
            onRemoveImage={(patientId, imageIndex) => handleRemoveImage(monthIndex, patientId, imageIndex)} 
            onImagePreviewClick={handleOpenImageModal} 
            onAddPatient={() => handleAddPatient(monthIndex)} 
            onRemovePatient={(patientId) => handleRemovePatient(monthIndex, patientId)}
            isMinimized={minimizedStates[monthIndex]}
            onToggleMinimize={() => toggleTableMinimize(monthIndex)}
          />
        ))}
        {!searchQuery && !hasInitialData && (
          <div className="text-slate-500 text-center py-4 sm:py-6 w-full max-w-7xl text-xs sm:text-sm"> {/* Reduced padding and font size */}
            No patients scheduled for the selected year. Add patients using the 'Add' button in each month's table.
          </div>
        )}
        {searchQuery && totalFilteredPatients === 0 && (
          <div className="text-slate-500 text-center py-4 sm:py-6 w-full max-w-7xl text-xs sm:text-sm"> {/* Reduced padding and font size */}
            No patients found matching your search criteria "{searchQuery}".
          </div>
        )}
      </main>
      
      <ImageModal 
        isOpen={isImageModalOpen}
        imageUrl={selectedImageUrl}
        onClose={handleCloseImageModal}
      />

      <footer className="mt-4 sm:mt-6 text-center text-xs text-slate-300 bg-slate-900/75 p-1.5 sm:p-2 rounded-lg shadow-md"> {/* Reduced margin, padding and font size */}
        <p>Designed by THY SEYHA for optimal patient flow management.</p>
      </footer>
    </div>
  );
};

export default App;
