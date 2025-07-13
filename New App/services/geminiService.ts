

import { GoogleGenAI, Type } from "@google/genai";
import { EndoscopyImage, Gender, Patient, ProcedureType, Report } from "../types";
import { TranslationKeys } from "../i18n";
import { REGIONS_BY_PROCEDURE } from "../constants";

if (!process.env.API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const diagnosisSchema = {
    type: Type.OBJECT,
    properties: {
        diagnosis: {
            type: Type.STRING,
            description: "A short, concise medical term for the diagnosis."
        }
    }
};

export const getAIDiagnosis = async (image: EndoscopyImage, t: (key: TranslationKeys, options?: Record<string, string | number>) => string) => {
  if (!process.env.API_KEY) {
    throw new Error("API key for Gemini is not configured.");
  }
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: image.imageDataUrl.split(',')[1],
    },
  };
  
  const regionName = t(`region_${image.region}` as TranslationKeys);
  const prompt = t('ai_prompt', { region: regionName, label: image.label });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, {text: prompt}] },
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
      },
    });

    let jsonStr = response.text.trim();
    
    const parsedData = JSON.parse(jsonStr);
    
    if (typeof parsedData.diagnosis === 'string') {
        return {
            diagnosis: parsedData.diagnosis
        };
    } else {
        throw new Error("AI response is not in the expected format.");
    }

  } catch (error) {
    console.error("Error getting AI diagnosis:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};


const summarySchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A concise clinical summary of the report."
        }
    }
};

export const summarizeReport = async (patient: Patient, report: Report, t: (key: TranslationKeys, options?: Record<string, string | number>) => string) => {
    if (!process.env.API_KEY) {
        throw new Error("API key for Gemini is not configured.");
    }
    
    const prompt = `
        Based on the following patient and endoscopy report information, generate a concise clinical summary.
        The summary should be easy to read and highlight the key findings and conclusion.
        Structure the output as a JSON object with a single key: "summary".

        Patient Information:
        - Name: ${patient.name}
        - Age: ${patient.age}
        - Gender: ${t(`gender_${patient.gender.toLowerCase()}` as TranslationKeys)}
        - Patient ID: ${patient.id}

        Report Details:
        - Procedure: ${t(`proc_${report.procedureType.toLowerCase()}` as TranslationKeys)}
        - Procedure Date: ${new Date(report.procedureDate).toLocaleDateString()}
        - Indication for Procedure: ${report.indication || 'Not specified'}
        - Conclusion: ${report.diagnosis}
        
        Images: ${report.images.length > 0 ? report.images.length + ' images were taken.' : 'No images were taken.'}
        ${report.images.map(img => `- Image of ${t(`region_${img.region}` as TranslationKeys)}: User-labeled as '${img.label}'`).join('\n')}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: summarySchema,
            },
        });
        
        let jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);
        
        if (typeof parsedData.summary === 'string') {
            return parsedData.summary;
        } else {
            throw new Error("AI response is not in the expected format.");
        }
    } catch (error) {
        console.error("Error getting AI summary:", error);
        throw new Error("Failed to get a valid response from the AI model.");
    }
};

const guidelineSchema = {
    type: Type.OBJECT,
    properties: {
        guidelines: {
            type: Type.ARRAY,
            description: "An array of guideline recommendations, organized by anatomical region.",
            items: {
                type: Type.OBJECT,
                properties: {
                    region: {
                        type: Type.STRING,
                        description: "The anatomical region key (e.g., 'esophagus', 'sigmoid_colon')."
                    },
                    findings: {
                        type: Type.ARRAY,
                        description: "A list of potential findings and recommendations for this region.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: {
                                    type: Type.STRING,
                                    description: "The name of the finding or guideline (e.g., 'Barrett's Esophagus Surveillance')."
                                },
                                details: {
                                    type: Type.STRING,
                                    description: "Detailed information about the guideline, including criteria and recommendations."
                                }
                            },
                            required: ['name', 'details']
                        }
                    }
                },
                required: ['region', 'findings']
            }
        }
    },
    required: ['guidelines']
};

export const getAIGuidelines = async (age: number, gender: Gender, procedureType: ProcedureType, t: (key: TranslationKeys, options?: Record<string, string | number>) => string) => {
    if (!process.env.API_KEY) {
        throw new Error("API key for Gemini is not configured.");
    }
    
    const regions = REGIONS_BY_PROCEDURE[procedureType].join(', ');
    const procedureName = t(`proc_${procedureType.toLowerCase()}` as TranslationKeys);
    const genderName = t(`gender_${gender.toLowerCase()}` as TranslationKeys);

    const prompt = t('ai_guideline_prompt', {
        age,
        gender: genderName,
        procedureType: procedureName,
        regions,
    });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: guidelineSchema,
            },
        });
        
        const parsedData = JSON.parse(response.text);
        
        if (parsedData.guidelines && Array.isArray(parsedData.guidelines)) {
            return parsedData;
        } else {
            throw new Error("AI response is not in the expected format.");
        }

    } catch (error) {
        console.error("Error getting AI guidelines:", error);
        throw new Error("Failed to get a valid response from the AI model for guidelines.");
    }
};