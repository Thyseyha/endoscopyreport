

export enum Gender {
    MALE = 'Male',
    FEMALE = 'Female',
    OTHER = 'Other'
}

export enum ProcedureType {
    GASTROSCOPY = 'Gastroscopy',
    COLONOSCOPY = 'Colonoscopy',
    ERCP = 'ERCP',
    EUS = 'EUS',
    CHOLANGIOSCOPY = 'Cholangioscopy',
    ENTEROSCOPY = 'Enteroscopy',
}

export enum AnesthesiaType {
    GENERAL = 'General Anesthesia',
    MAC = 'Monitored Anesthesia Care (MAC)',
    CONSCIOUS_SEDATION = 'Conscious Sedation',
    NONE = 'None',
}

export enum PatientStatus {
    OUTPATIENT = 'Outpatient',
    INPATIENT = 'Inpatient',
    EMERGENCY = 'Emergency',
}


export interface Doctor {
    id: string;
    name: string;
}

export interface Assistant {
    id: string;
    name: string;
}

export interface BostonBowelPrepScale {
    right: number;
    transverse: number;
    left: number;
}

export interface EndoscopyImage {
    id: string;
    region: string;
    imageDataUrl: string; // base64
    label: string;
    aiDiagnosis?: string;
}

export interface Report {
    id:string;
    procedureDate: string;
    procedureType: ProcedureType;
    
    diagnosis: string; // Conclusion
    findings?: Record<string, string>; // Per-region findings
    consent?: string;
    indication?: string;
    recommendation?: string;
    
    images: EndoscopyImage[];
    endoscopistId?: string;
    assistantIds?: string[];
    
    anesthetistName?: string;
    anesthesiaType?: AnesthesiaType;
    patientStatus?: PatientStatus;
    bostonBowelPrepScale?: BostonBowelPrepScale;
}

export interface Patient {
    id: string; // National ID or unique identifier
    name: string;
    age: number;
    gender: Gender;
    reports: Report[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  aiEnabled: boolean;
  lastSynced?: string | null;
}

export interface GuidelineFinding {
    name: string;
    details: string;
}

export interface GuidelineRegion {
    region: string;
    findings: GuidelineFinding[];
}