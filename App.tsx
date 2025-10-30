import React, { useEffect } from 'react';
import useAppStore from './hooks/useAppStore';
import Loader from './components/Loader';
import AuthPage from './components/auth/AuthPage';
import OnboardingWizard from './components/OnboardingWizard';
import Dashboard from './components/Dashboard';
import CareerDetailView from './components/CareerDetailView';
import Chatbot from './components/Chatbot';
import { onAuthStateChangedListener, loadUserData } from './services/firebaseService';
import { getAuth } from 'firebase/auth';

const App: React.FC = () => {
  const { 
    userProfile, 
    selectedCareer, 
    isRestoring, 
    setRestoredState, 
    reset,
    isAnalyzing
  } = useAppStore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      if (user) {
        const userData = await loadUserData(user.uid);
        if (userData) {
          setRestoredState(userData);
        } else {
           // New user, or user with no saved data yet.
           useAppStore.setState({ isRestoring: false });
        }
      } else {
        reset();
        useAppStore.setState({ isRestoring: false });
      }
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isRestoring) {
    return <Loader message="Restoring your session..." />;
  }

  const renderContent = () => {
    if (!auth.currentUser) {
      return <AuthPage />;
    }
    
    if (isAnalyzing) {
      return <Loader message="Analyzing your profile with AI..." />;
    }

    if (userProfile && recommendations.length > 0) {
       if (selectedCareer) {
         return <CareerDetailView />;
       }
       return <Dashboard />;
    }
    
    // If user is logged in but has no profile, show onboarding
    return <OnboardingWizard isAnalyzing={isAnalyzing} />;
  };
  
  const { recommendations } = useAppStore.getState();

  return (
    <div className="min-h-screen bg-bg-dark font-sans antialiased">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {renderContent()}
      </main>
      {auth.currentUser && <Chatbot />}
    </div>
  );
};

export default App;