
import React from 'react';
import { PatientScheduleEntry } from '../types.js';

interface ScheduleTableProps {
  monthName: string;
  patients: PatientScheduleEntry[];
  numOtherColumns?: number;
  onDateChange: (patientId: string, newDate: string) => void;
  onSexChange: (patientId: string, newSex: 'M' | 'F' | '') => void;
  onAgeChange: (patientId: string, newAge: string) => void;
  onNameChange: (patientId: string, newName: string) => void;
  onOperatorChange: (patientId: string, newOperator: string) => void; // New prop
  onImageUpload: (patientId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (patientId: string, imageIndex: number) => void;
  onImagePreviewClick: (imageUrl: string) => void;
  onAddPatient: () => void;
  onRemovePatient: (patientId: string) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  monthName,
  patients,
  numOtherColumns = 8, 
  onDateChange,
  onSexChange,
  onAgeChange,
  onNameChange,
  onOperatorChange, 
  onImageUpload,
  onRemoveImage,
  onImagePreviewClick,
  onAddPatient,
  onRemovePatient,
  isMinimized,
  onToggleMinimize,
}) => {
  const actualNumConfigurableColumns = Math.max(4, numOtherColumns); 

  const headers: string[] = ["#", "Patient Details"];
  let numberOfExplicitlyNamedConfigurableColumns = 0;

  if (actualNumConfigurableColumns >= 1) {
    headers.push("Service");
    numberOfExplicitlyNamedConfigurableColumns = 1;
  }
  if (actualNumConfigurableColumns >= 2) {
    headers.push("Date");
    numberOfExplicitlyNamedConfigurableColumns = 2;
  }
  if (actualNumConfigurableColumns >= 3) {
    headers.push("Diagnostic");
    numberOfExplicitlyNamedConfigurableColumns = 3;
  }
  if (actualNumConfigurableColumns >= 4) {
    headers.push("Indication");
    numberOfExplicitlyNamedConfigurableColumns = 4;
  }
  if (actualNumConfigurableColumns >= 5) {
    headers.push("PLANNING");
    numberOfExplicitlyNamedConfigurableColumns = 5;
  }
  if (actualNumConfigurableColumns >= 6) {
    headers.push("OPERATOR");
    numberOfExplicitlyNamedConfigurableColumns = 6;
  }
  if (actualNumConfigurableColumns >= 7) { 
    headers.push("Image");
    numberOfExplicitlyNamedConfigurableColumns = 7;
  }

  const numRemainingPurelyOtherColumns = actualNumConfigurableColumns - numberOfExplicitlyNamedConfigurableColumns;
  if (numRemainingPurelyOtherColumns > 0) {
    headers.push(...Array(numRemainingPurelyOtherColumns).fill("Other"));
  }
  headers.push("Actions"); 

  const operatorOptions = ["", "Prof. KY Vutha", "Dr. OUNG Borathchakra", "Dr. LY Kimchhun", "Dr. RO Kimchhay"];

  return (
    <div className="w-full max-w-7xl mx-auto bg-slate-800 shadow-xl rounded-md overflow-hidden border border-slate-700"> {/* Reduced shadow, radius */}
      <div 
        className={`px-2 py-1 sm:px-3 sm:py-1.5 ${!isMinimized ? 'border-b border-slate-700' : ''} flex justify-between items-center`} // Reduced padding
      >
        <h3 className="text-sm sm:text-base font-semibold text-sky-300">{monthName} Schedule</h3> {/* Reduced font size */}
        <div className="flex items-center space-x-1.5"> {/* Reduced space */}
          <button
            onClick={onToggleMinimize}
            className="px-1.5 py-0.5 sm:px-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors" // Reduced padding, radius, ring
            aria-expanded={!isMinimized}
            aria-controls={`schedule-table-body-${monthName.toLowerCase().replace(' ', '-')}`}
          >
            {isMinimized ? 'Expand' : 'Minimize'}
            <span className="ml-1" aria-hidden="true">{isMinimized ? '►' : '▼'}</span> {/* Reduced margin */}
          </button>
        </div>
      </div>
      {!isMinimized && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-1 py-1 sm:px-1.5 sm:py-1.5 text-center align-middle bg-slate-700 sticky left-0 z-20"> {/* Reduced padding */}
                  <button
                    onClick={onAddPatient}
                    className="px-1.5 py-0.5 sm:px-2 text-xs bg-green-600 hover:bg-green-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-green-400 focus:ring-offset-1 focus:ring-offset-slate-700 transition-colors flex items-center justify-center w-full" // Reduced padding, radius, ring
                    aria-label={`Add new patient to ${monthName} schedule`}
                    title="Add New Patient"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor"> {/* Reduced size, margin */}
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add
                  </button>
                </th>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-1.5 py-1.5 sm:px-2 sm:py-2 text-left text-xs font-medium text-sky-300 uppercase tracking-wider whitespace-nowrap ${header === "#" ? "w-8 sm:w-10 text-center" : ""} ${header === "Patient Details" ? "min-w-[180px] sm:min-w-[220px] lg:min-w-[260px]" : ""} ${header === "Diagnostic" ? "min-w-[160px] sm:min-w-[200px] lg:min-w-[240px]" : ""} ${header === "Actions" ? "text-center" : ""} ${header === "Image" ? "min-w-[100px] sm:min-w-[120px]" : ""} ${header === "OPERATOR" ? "min-w-[120px] sm:min-w-[140px]" : ""}`} // Reduced padding, font, min-widths
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody id={`schedule-table-body-${monthName.toLowerCase().replace(' ', '-')}`} className="bg-slate-800 divide-y divide-slate-700">
              {patients.map((patient, rowIndex) => (
                <tr key={patient.id} className="hover:bg-slate-750 transition-colors duration-150">
                  <td className="px-1 py-1.5 sm:px-1.5 sm:py-2 whitespace-nowrap text-xs text-center text-slate-400 bg-slate-800 sticky left-0 z-10"> {/* Reduced padding */}
                    {/* Empty for sticky add button col */}
                  </td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-center text-slate-400"> {/* Reduced padding */}
                    {rowIndex + 1}
                  </td>

                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs font-medium text-slate-200"> {/* Reduced padding */}
                    <div className="flex flex-col space-y-1"> {/* Reduced spacing */}
                      <input
                        type="text"
                        value={patient.name || ''}
                        onChange={(e) => onNameChange(patient.id, e.target.value)}
                        className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-full" // Reduced padding, radius
                        placeholder="Name"
                        aria-label={`Patient Name for patient ${rowIndex + 1} in ${monthName}`}
                      />
                      <div className="flex items-center space-x-1"> {/* Reduced spacing */}
                        <input
                          type="number"
                          value={patient.age || ''}
                          onChange={(e) => onAgeChange(patient.id, e.target.value)}
                          min="0"
                          max="150"
                          className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-10 sm:w-12 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" // Reduced padding, radius, width
                          placeholder="Age"
                          aria-label={`Age for patient ${rowIndex + 1} in ${monthName}`}
                        />
                        <select
                          value={patient.sex || ''}
                          onChange={(e) => onSexChange(patient.id, e.target.value as 'M' | 'F' | '')}
                          className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-0.5 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none min-w-[35px] sm:min-w-[40px]" // Reduced padding, radius, min-width
                          aria-label={`Sex for patient ${rowIndex + 1} in ${monthName}`}
                        >
                          <option value="">--</option>
                          <option value="M">M</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>
                  </td>

                  {/* Service Column */}
                  {actualNumConfigurableColumns >= 1 && (
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-slate-400"> {/* Reduced padding */}
                      <input 
                        type="text" 
                        placeholder="Service"
                        className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-full" // Reduced padding, radius
                        aria-label={`Service for patient ${rowIndex + 1} in ${monthName}`}
                      />
                    </td>
                  )}

                  {/* Date Column */}
                  {actualNumConfigurableColumns >= 2 && (
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-slate-400"> {/* Reduced padding */}
                      <input
                        type="date"
                        value={patient.date || ''}
                        onChange={(e) => onDateChange(patient.id, e.target.value)}
                        className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-xs w-full appearance-none" // Reduced padding, radius
                        aria-label={`Procedure date for patient ${rowIndex + 1} in ${monthName}`}
                      />
                    </td>
                  )}

                  {/* Diagnostic Column */}
                  {actualNumConfigurableColumns >= 3 && (
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-slate-400"> {/* Reduced padding */}
                       <textarea 
                        placeholder="Diagnostic"
                        className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-full min-h-[40px] sm:min-h-[50px]" // Reduced padding, radius, min-height
                        aria-label={`Diagnostic for patient ${rowIndex + 1} in ${monthName}`}
                        rows={2} // Reduced rows
                      />
                    </td>
                  )}

                  {/* Indication Column */}
                  {actualNumConfigurableColumns >= 4 && (
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-slate-400"> {/* Reduced padding */}
                       <input 
                        type="text" 
                        placeholder="Indication"
                        className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-full" // Reduced padding, radius
                        aria-label={`Indication for patient ${rowIndex + 1} in ${monthName}`}
                      />
                    </td>
                  )}

                  {/* PLANNING Column */}
                  {actualNumConfigurableColumns >= 5 && (
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-slate-400"> {/* Reduced padding */}
                       <input 
                        type="text" 
                        placeholder="Planning"
                        className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-full" // Reduced padding, radius
                        aria-label={`Planning for patient ${rowIndex + 1} in ${monthName}`}
                      />
                    </td>
                  )}

                  {/* OPERATOR Column */}
                  {actualNumConfigurableColumns >= 6 && (
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-slate-400"> {/* Reduced padding */}
                       <select
                        value={patient.operator || ''}
                        onChange={(e) => onOperatorChange(patient.id, e.target.value)}
                        className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-full appearance-none" // Reduced padding, radius
                        aria-label={`Operator for patient ${rowIndex + 1} in ${monthName}`}
                      >
                        {operatorOptions.map((option, optIndex) => (
                          <option key={optIndex} value={option} disabled={optIndex === 0 && !patient.operator}>
                            {option === "" ? "-- Operator --" : option}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}

                  {/* Image Upload Column */}
                  {actualNumConfigurableColumns >= 7 && (
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-slate-400"> {/* Reduced padding */}
                      <div className="flex flex-col space-y-1 items-start"> {/* Reduced spacing */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onImageUpload(patient.id, e)}
                          className="block w-full text-xs text-slate-400
                            file:mr-1 file:py-0.5 file:px-1 
                            file:rounded file:border-0
                            file:text-xs file:font-semibold
                            file:bg-sky-600 file:text-sky-50
                            hover:file:bg-sky-500
                            focus:outline-none focus:ring-1 focus:ring-sky-500 mb-1" // Reduced file button padding, margin
                          aria-label={`Upload image for patient ${rowIndex + 1} in ${monthName}`}
                          key={`file-input-${patient.id}-${patient.uploadedImages?.length || 0}`}
                        />
                        <div className="flex flex-wrap gap-1"> {/* Reduced gap */}
                          {(patient.uploadedImages || []).map((imageSrc, imgIndex) => (
                            <div key={`${patient.id}-img-${imgIndex}`} className="relative group w-10 h-10 sm:w-12 sm:h-12"> {/* Reduced size */}
                              <img
                                src={imageSrc}
                                alt={`Uploaded image ${imgIndex + 1} for patient ${rowIndex + 1}`}
                                className="w-full h-full object-cover rounded border border-slate-600 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => onImagePreviewClick(imageSrc)}
                                title="Click to zoom image"
                              />
                              <button
                                onClick={() => onRemoveImage(patient.id, imgIndex)}
                                className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-red-400"
                                aria-label={`Remove image ${imgIndex + 1}`}
                                title={`Remove image ${imgIndex + 1}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"> {/* Reduced icon size */}
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {Array(numRemainingPurelyOtherColumns).fill(null).map((_, colIndex) => (
                    <td
                      key={`${patient.id}-purely-other-col-${colIndex}`}
                      className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-slate-400" // Reduced padding
                    >
                      <input 
                        type="text" 
                        placeholder="Other"
                        className="bg-slate-700 text-slate-200 border border-slate-600 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-full" // Reduced padding, radius
                        aria-label={`Other data ${colIndex + 1} for patient ${rowIndex + 1} in ${monthName}`}
                      />
                    </td>
                  ))}
                  {/* Actions Column Cell */}
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 whitespace-nowrap text-xs text-center"> {/* Reduced padding */}
                    <button
                      onClick={() => onRemovePatient(patient.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      aria-label={`Remove patient ${patient.name || `PAT-${rowIndex + 1}`} from ${monthName} schedule`}
                      title="Remove Patient"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor"> {/* Reduced size */}
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && ( 
                <tr>
                  <td colSpan={headers.length + 1} className="px-3 py-4 sm:px-4 sm:py-6 text-center text-xs text-slate-500"> {/* Reduced padding */}
                    No patients scheduled for {monthName}. Click "Add" to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;
