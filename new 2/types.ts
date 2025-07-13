export interface Classification {
  system: string; // e.g., "PARIS", "NICE", "Forrest"
  value: string; // e.g., "0-Is", "Type 2", "IIc"
  description: string; // A brief explanation of the classification system.
}

export interface AnalysisResult {
  lesionType: string;
  location: string;
  detailedDescription: string;
  classifications: Classification[];
  histologyPrediction: string;
  managementRecommendation: string;
  confidenceScore: number;
  explanation: string;
}