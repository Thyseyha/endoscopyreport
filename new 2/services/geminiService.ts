import { GoogleGenAI, Type, Part } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        lesionType: {
            type: Type.STRING,
            description: "The primary type of lesion identified (e.g., 'Colon Polyp', 'Gastric Ulcer', 'Barrett\\'s Esophagus')."
        },
        location: {
            type: Type.STRING,
            description: "The likely anatomical location of the lesion (e.g., 'Sigmoid Colon', 'Gastric Antrum', 'Distal Esophagus')."
        },
        detailedDescription: {
            type: Type.STRING,
            description: "A detailed description of the lesion's visual characteristics (size, shape, color, surface pattern, vascular features)."
        },
        classifications: {
            type: Type.ARRAY,
            description: "An array of relevant endoscopic classifications applied to the lesion.",
            items: {
                type: Type.OBJECT,
                properties: {
                    system: {
                        type: Type.STRING,
                        description: "Name of the classification system (e.g., 'PARIS', 'Forrest', 'Prague C&M')."
                    },
                    value: {
                        type: Type.STRING,
                        description: "The classification value or grade (e.g., '0-IIa', 'IIc', 'C2M5')."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief explanation of what the classification system evaluates."
                    }
                },
                required: ["system", "value", "description"]
            }
        },
        histologyPrediction: {
            type: Type.STRING,
            description: "The most likely histology (e.g., 'Hyperplastic polyp', 'Tubular adenoma', 'Invasive adenocarcinoma', 'H. pylori gastritis')."
        },
        managementRecommendation: {
            type: Type.STRING,
            description: "Recommended management action (e.g., 'Cold snare polypectomy', 'Biopsy and CLO test', 'Surveillance endoscopy in 3 years')."
        },
        confidenceScore: {
            type: Type.NUMBER,
            description: "A confidence score from 0 to 100 on the overall analysis."
        },
        explanation: {
            type: Type.STRING,
            description: "A brief, one-sentence explanation for the analysis, highlighting key visual features."
        }
    },
    required: ["lesionType", "location", "detailedDescription", "classifications", "histologyPrediction", "managementRecommendation", "confidenceScore", "explanation"],
};

export const analyzeLesionImage = async (imagePart: Part, additionalInfo: string): Promise<AnalysisResult> => {
    try {
        const prompt = `
            You are an expert gastroenterologist and pathologist specializing in endoscopic imaging analysis.
            Your task is to analyze the provided image of a lesion from the upper or lower GI tract.
            
            1.  **Identify the lesion type** (e.g., Polyp, Ulcer, Erosion, Mass, Barrett's Esophagus, Atrophic Gastritis).
            2.  **Specify the likely anatomical location** (e.g., Sigmoid Colon, Gastric Antrum, Distal Esophagus).
            3.  **Provide a detailed description** of the lesion's visual characteristics (morphology, color, surface pattern, vascular pattern).
            4.  **Classify the lesion** using relevant and established international systems. Only include classifications applicable to the lesion shown. Examples include:
                - For colonic polyps: PARIS, NICE, JNET, KUDO, SANO.
                - For esophageal lesions: Prague C&M (for Barrett's), Los Angeles (for esophagitis), IPCL (for squamous cell neoplasia).
                - For gastric/duodenal ulcers: Forrest classification.
                - For gastritis: Kimura-Takemoto classification.
                - For histology/neoplasia: Vienna classification.
            5.  **Predict the most likely histology**.
            6.  **Recommend a management action**.
            7.  **Provide an overall confidence score** (0-100) and a **brief explanation** for your analysis, highlighting key visual features.

            ${additionalInfo ? `In addition to the image, consider the following clinical context: "${additionalInfo}". Integrate this information into your analysis for a more comprehensive assessment.` : ''}
            
            Return your findings in the specified JSON format.
        `.trim();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as AnalysisResult;
        return result;

    } catch (error) {
        console.error("Error analyzing image with Gemini API:", error);
        throw new Error("Failed to get analysis from AI service.");
    }
};