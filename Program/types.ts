export interface PatientScheduleEntry {
  id: string; // Represents a unique patient ID within a month's schedule
  name?: string; // Full name of the patient
  sex?: 'M' | 'F' | ''; // Sex of the patient
  age?: string | null; // Age of the patient
  date: string | null; // Selected date for the ERCP procedure, YYYY-MM-DD format or null
  operator?: string; // Selected operator name
  uploadedImages?: string[]; // Array of Base64 data URLs for uploaded images
}

// If in the future, 'Other' columns need specific data:
// export interface PatientData {
//   id: string;
//   name?: string; 
//   sex?: 'M' | 'F' | '';
//   age?: string | null;
//   date: string | null;
//   otherValues: string[]; // Array of strings for the "Other" columns
// }