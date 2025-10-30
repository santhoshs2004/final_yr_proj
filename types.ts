export interface UserProfile {
    name: string;
    resumeText: string;
    githubUrl: string;
    leetcodeUrl: string;
    interests: string;
    personalityQuizAnswers: Record<string, string>;
}

export interface CareerRecommendation {
    jobTitle: string;
    matchPercentage: number;
    reasoning: string;
    requiredSkills: string[];
}

export interface Skill {
    skill: string;
    importance: 'High' | 'Medium' | 'Low';
}

export interface SkillGapAnalysisData {
    summary: string;
    missingSkills: Skill[];
}

export interface LearningObjective {
    description: string;
    link?: string;
}

export interface LearningStep {
    title: string;
    duration: string;
    learningObjectives: LearningObjective[];
    projectSuggestion: string;
}

export interface LearningPathData {
    estimatedTimeToCompletion: string;
    path: LearningStep[];
}

export interface FutureOutlookData {
    fiveYearDemand: string;
    salaryTrend: {
        growthPercentage: number;
        commentary: string;
    };
    automationRisk: {
        level: 'High' | 'Medium' | 'Low';
        percentage: number;
        commentary: string;
    };
    newSkillsOnTheRise: { skill: string }[];
}

export interface JobPosting {
    title: string;
    company: string;
    url: string;
}

export interface GroundingSource {
    web?: {
// FIX: Make uri and title optional to match the Gemini API's GroundingChunk type.
        uri?: string;
        title?: string;
    }
}

export interface LiveJobsData {
    postings: JobPosting[];
    sources?: GroundingSource[];
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface CareerDetails {
    skillGap: SkillGapAnalysisData | null;
    learningPath: LearningPathData | null;
    futureOutlook: FutureOutlookData | null;
    liveJobs: LiveJobsData | null;
}

// This is the top-level object stored in Firestore for each user
export interface UserData {
    userProfile: UserProfile | null;
    recommendations: CareerRecommendation[];
    learningProgress: Record<string, boolean>; // Maps step titles to completion status
    chatHistory: ChatMessage[];
}