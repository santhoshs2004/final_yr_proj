import { GoogleGenAI, Type, Chat } from "@google/genai";
import { 
    UserProfile,
    CareerRecommendation,
    SkillGapAnalysisData,
    LearningPathData,
    FutureOutlookData,
    LiveJobsData,
    GroundingSource,
} from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const safeJsonParse = (text: string) => {
    try {
        const firstBracket = text.indexOf('{');
        const lastBracket = text.lastIndexOf('}');
        const firstSquare = text.indexOf('[');
        const lastSquare = text.lastIndexOf(']');

        let start = -1;
        let end = -1;

        if (firstBracket !== -1 && lastBracket !== -1) {
            start = firstBracket;
            end = lastBracket;
        }
        if (firstSquare !== -1 && lastSquare !== -1) {
            // If an array starts before an object, assume it's the main container
            if (start === -1 || firstSquare < start) {
                start = firstSquare;
                end = lastSquare;
            }
        }

        if (start !== -1 && end !== -1) {
            const jsonString = text.substring(start, end + 1);
            return JSON.parse(jsonString);
        }
        console.error("Could not find JSON start/end in text:", text);
        return null;
    } catch (e) {
        console.error("Failed to parse JSON:", e, "Original text:", text);
        return null;
    }
}

export const getCareerRecommendations = async (userProfile: UserProfile): Promise<CareerRecommendation[] | null> => {
    const prompt = `
        Based on the following user profile, act as an expert career counselor. Recommend 3 distinct and suitable career paths.
        
        User Profile:
        - Resume Text: ${userProfile.resumeText}
        - Interests: ${userProfile.interests}
        - Personality Quiz Answers: ${JSON.stringify(userProfile.personalityQuizAnswers)}

        Your response MUST be a valid JSON array of objects. Each object must have these exact keys: "jobTitle", "matchPercentage", "reasoning", "requiredSkills".
        - "jobTitle": A clear job title.
        - "matchPercentage": An integer (0-100) indicating how well it fits their profile.
        - "reasoning": A brief, compelling reasoning (1-2 sentences) for why it's a good fit.
        - "requiredSkills": An array of the top 5 most important skill strings for this role.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            jobTitle: { type: Type.STRING },
                            matchPercentage: { type: Type.NUMBER },
                            reasoning: { type: Type.STRING },
                            requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["jobTitle", "matchPercentage", "reasoning", "requiredSkills"],
                    }
                }
            }
        });
        return JSON.parse(response.text) as CareerRecommendation[];
    } catch (error) {
        console.error("Failed to get career recommendations:", error);
        return null;
    }
};

export const getSkillGapAnalysis = async (resumeText: string, jobTitle: string): Promise<SkillGapAnalysisData | null> => {
    const prompt = `Analyze the provided resume against the requirements for a "${jobTitle}". Identify key skills the user is missing. 
    
    Resume:
    ---
    ${resumeText}
    ---
    
    Your response MUST be a valid JSON object with two keys: "summary" (a string summarizing the gap) and "missingSkills" (an array of objects, where each object has "skill" (string) and "importance" ('High', 'Medium', or 'Low')).
    `;
     try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        missingSkills: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    skill: { type: Type.STRING },
                                    importance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                                },
                                required: ['skill', 'importance']
                            }
                        },
                    },
                    required: ["summary", "missingSkills"],
                }
            }
        });
        return JSON.parse(response.text) as SkillGapAnalysisData;
    } catch (error) {
        console.error("Failed to get skill gap analysis:", error);
        return null;
    }
};

export const getLearningPath = async (missingSkills: string[]): Promise<LearningPathData | null> => {
    const prompt = `Create a structured, step-by-step learning path to acquire these skills: ${missingSkills.join(', ')}.
    Your response MUST be a valid JSON object with two keys: "estimatedTimeToCompletion" (a string like "3-6 months") and "path" (an array of step objects).
    Each step object must have: "title" (string), "duration" (string), "learningObjectives" (an array of objects with "description" and optional "link" strings), and "projectSuggestion" (string).
    Ensure you provide real, valid URLs for course links where possible.`;
     try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedTimeToCompletion: { type: Type.STRING },
                        path: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                    learningObjectives: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                description: { type: Type.STRING },
                                                link: { type: Type.STRING },
                                            },
                                            required: ['description']
                                        }
                                    },
                                    projectSuggestion: { type: Type.STRING }
                                },
                                required: ['title', 'duration', 'learningObjectives', 'projectSuggestion']
                            }
                        }
                    },
                    required: ["estimatedTimeToCompletion", "path"],
                }
            }
        });
        return JSON.parse(response.text) as LearningPathData;
    } catch (error) {
        console.error("Failed to get learning path:", error);
        return null;
    }
};

export const getFutureOutlook = async (jobTitle: string): Promise<FutureOutlookData | null> => {
    const prompt = `Provide a 5-year future outlook for the role of "${jobTitle}".
    Your response MUST be a valid JSON object with these keys: "fiveYearDemand", "salaryTrend", "automationRisk", and "newSkillsOnTheRise".
    - "salaryTrend" must be an object with "growthPercentage" (number) and "commentary" (string).
    - "automationRisk" must be an object with "level" ('High'/'Medium'/'Low'), "percentage" (number), and "commentary" (string).
    - "newSkillsOnTheRise" must be an array of objects, each with a "skill" (string).
    `;
     try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        fiveYearDemand: { type: Type.STRING },
                        salaryTrend: {
                            type: Type.OBJECT,
                            properties: {
                                growthPercentage: { type: Type.NUMBER },
                                commentary: { type: Type.STRING }
                            },
                            required: ['growthPercentage', 'commentary']
                        },
                        automationRisk: {
                             type: Type.OBJECT,
                             properties: {
                                 level: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                                 percentage: { type: Type.NUMBER },
                                 commentary: { type: Type.STRING }
                             },
                             required: ['level', 'percentage', 'commentary']
                        },
                        newSkillsOnTheRise: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { skill: { type: Type.STRING } },
                                required: ['skill']
                            }
                        }
                    },
                    required: ["fiveYearDemand", "salaryTrend", "automationRisk", "newSkillsOnTheRise"],
                }
            }
        });
        return JSON.parse(response.text) as FutureOutlookData;
    } catch (error) {
        console.error("Failed to get future outlook:", error);
        return null;
    }
};

export const getLiveJobs = async (jobTitle: string): Promise<LiveJobsData | null> => {
    const prompt = `Find 3-5 recent job postings for a "${jobTitle}" using Google Search. IMPORTANT: If you cannot find any jobs, you MUST return a valid JSON object with an empty "postings" array: {"postings": []}. Otherwise, respond with a JSON object containing a "postings" key, which is an array of objects. Each object should have "title", "company", and "url" keys.`;
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const parsed = safeJsonParse(response.text);

        if (parsed && Array.isArray(parsed.postings)) {
             return {
                postings: parsed.postings,
                sources,
            };
        }
        
        // Handle cases where parsing fails or doesn't produce the expected structure
        console.warn("Could not parse live jobs as expected, returning empty.", response.text);
        return { postings: [], sources };

    } catch (error) {
        console.error("Failed to get live jobs:", error);
        return { postings: [], sources: [] };
    }
};

export const startChat = (): Chat => {
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are Proxima, a friendly and helpful AI career assistant. Help the user explore their career options and understand the details provided about their recommended career path. Keep responses concise and helpful.',
      },
    });
};

export const streamChatResponse = async (chat: Chat, message: string, onChunk: (chunk: string) => void): Promise<void> => {
    try {
        const responseStream = await chat.sendMessageStream({ message });
        for await (const chunk of responseStream) {
            onChunk(chunk.text);
        }
    } catch (error) {
        console.error("Chat streaming error:", error);
        onChunk("Sorry, I encountered an error. Please try again.");
    }
};