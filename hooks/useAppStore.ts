import { create } from 'zustand';
import { 
    UserData, 
    UserProfile,
    CareerRecommendation,
    CareerDetails,
    ChatMessage
} from '../types';
import { saveUserData, signOutUser } from '../services/firebaseService';
import { getAuth } from 'firebase/auth';

interface AppState {
  isRestoring: boolean;
  isAnalyzing: boolean;
  
  userProfile: UserProfile | null;
  recommendations: CareerRecommendation[];
  
  selectedCareer: CareerRecommendation | null;
  careerDetails: CareerDetails;
  isLoadingDetails: boolean;
  
  learningProgress: Record<string, boolean>;
  
  isChatOpen: boolean;
  chatHistory: ChatMessage[];

  setRestoredState: (data: UserData) => void;
  setUserProfile: (profile: UserProfile) => void;
  setRecommendations: (recommendations: CareerRecommendation[]) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  
  setSelectedCareer: (career: CareerRecommendation | null) => void;
  setCareerDetails: (details: Partial<CareerDetails>) => void;
  setIsLoadingDetails: (isLoading: boolean) => void;
  
  toggleLearningStep: (stepTitle: string) => void;
  
  toggleChat: () => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastChatMessage: (chunk: string) => void;

  reset: () => void;
}

const initialCareerDetails: CareerDetails = {
    skillGap: null,
    learningPath: null,
    futureOutlook: null,
    liveJobs: null,
};

const useAppStore = create<AppState>((set, get) => ({
  isRestoring: true,
  isAnalyzing: false,
  userProfile: null,
  recommendations: [],
  selectedCareer: null,
  careerDetails: initialCareerDetails,
  isLoadingDetails: false,
  learningProgress: {},
  isChatOpen: false,
  chatHistory: [],

  setRestoredState: (data) => set({ 
      userProfile: data.userProfile,
      recommendations: data.recommendations,
      learningProgress: data.learningProgress,
      chatHistory: data.chatHistory,
      isRestoring: false 
  }),

  setUserProfile: (profile) => {
    set({ userProfile: profile });
    const { recommendations, learningProgress, chatHistory } = get();
    const userId = getAuth().currentUser?.uid;
    if (userId) {
      saveUserData(userId, { userProfile: profile, recommendations, learningProgress, chatHistory });
    }
  },

  setRecommendations: (recommendations) => {
    set({ recommendations });
    const { userProfile, learningProgress, chatHistory } = get();
    const userId = getAuth().currentUser?.uid;
    if (userId && userProfile) {
      saveUserData(userId, { userProfile, recommendations, learningProgress, chatHistory });
    }
  },
  
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  
  setSelectedCareer: (career) => set({ 
      selectedCareer: career, 
      // Reset details and progress when a new career is selected
      careerDetails: initialCareerDetails, 
      learningProgress: {} 
  }),

  setCareerDetails: (details) => set(state => ({ careerDetails: { ...state.careerDetails, ...details } })),
  
  setIsLoadingDetails: (isLoading) => set({ isLoadingDetails: isLoading }),
  
  toggleLearningStep: (stepTitle) => {
    const newLearningProgress = {
        ...get().learningProgress,
        [stepTitle]: !get().learningProgress[stepTitle],
    };
    set({ learningProgress: newLearningProgress });
    const { userProfile, recommendations, chatHistory } = get();
    const userId = getAuth().currentUser?.uid;
    if (userId && userProfile) {
      saveUserData(userId, { userProfile, recommendations, learningProgress: newLearningProgress, chatHistory });
    }
  },
  
  toggleChat: () => set(state => ({ isChatOpen: !state.isChatOpen })),
  
  addChatMessage: (message) => {
    const newChatHistory = [...get().chatHistory, message];
    set({ chatHistory: newChatHistory });
    const { userProfile, recommendations, learningProgress } = get();
    const userId = getAuth().currentUser?.uid;
    if (userId && userProfile) {
        saveUserData(userId, { userProfile, recommendations, learningProgress, chatHistory: newChatHistory });
    }
  },

  updateLastChatMessage: (chunk) => set(state => {
      if (state.chatHistory.length === 0) return {};
      const lastMessage = state.chatHistory[state.chatHistory.length - 1];
      if (lastMessage && lastMessage.sender === 'ai') {
          const updatedMessage = { ...lastMessage, text: lastMessage.text + chunk };
          const newChatHistory = [...state.chatHistory.slice(0, -1), updatedMessage];
          // Note: We don't save to Firebase on every chunk for performance reasons.
          // The final message will be saved with the next user interaction.
          return { chatHistory: newChatHistory };
      }
      return {};
  }),

  reset: async () => {
    await signOutUser();
    set({
      isRestoring: false,
      isAnalyzing: false,
      userProfile: null,
      recommendations: [],
      selectedCareer: null,
      careerDetails: initialCareerDetails,
      isLoadingDetails: false,
      learningProgress: {},
      isChatOpen: false,
      chatHistory: [],
    });
  },
}));

export default useAppStore;