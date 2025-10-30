import React, { useState, useEffect } from 'react';
import useAppStore from '../hooks/useAppStore';
import SkillGapAnalysis from './SkillGapAnalysis';
import LearningPath from './LearningPath';
import FutureOutlook from './FutureOutlook';
import LiveJobs from './LiveJobs';
import FeatureCard from './FeatureCard';
import DetailModal from './DetailModal';
import { getSkillGapAnalysis, getLearningPath, getFutureOutlook, getLiveJobs } from '../services/geminiService';

// Icons for Feature Cards
import ChartBarIcon from './icons/ChartBarIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';

type ModalType = 'skillGap' | 'learningPath' | 'outlook' | 'jobs' | null;

const CareerDetailView: React.FC = () => {
    const { 
        selectedCareer,
        userProfile,
        setSelectedCareer, 
        setCareerDetails,
        setIsLoadingDetails,
        addChatMessage,
        reset,
    } = useAppStore();
    
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Proactive, parallel data fetching for all detail components
    useEffect(() => {
        const fetchAllDetails = async () => {
            if (!selectedCareer || !userProfile) return;

            setIsLoadingDetails(true);
            setCareerDetails({ skillGap: null, learningPath: null, futureOutlook: null, liveJobs: null });

            try {
                // Fire off independent requests in parallel
                const outlookPromise = getFutureOutlook(selectedCareer.jobTitle);
                const jobsPromise = getLiveJobs(selectedCareer.jobTitle);
                const skillGapPromise = getSkillGapAnalysis(userProfile.resumeText, selectedCareer.jobTitle);

                // Update store as data arrives
                outlookPromise.then(data => setCareerDetails({ futureOutlook: data }));
                jobsPromise.then(data => setCareerDetails({ liveJobs: data }));

                // Handle chained dependency (Learning Path depends on Skill Gap)
                const skillGapData = await skillGapPromise;
                setCareerDetails({ skillGap: skillGapData });

                if (skillGapData?.missingSkills && skillGapData.missingSkills.length > 0) {
                    const missingSkillNames = skillGapData.missingSkills.map(s => s.skill);
                    const learningPathData = await getLearningPath(missingSkillNames);
                    setCareerDetails({ learningPath: learningPathData });
                } else {
                    setCareerDetails({ learningPath: null }); // No skills missing, no path needed
                }
            } catch (error) {
                console.error("Failed to fetch one or more career details:", error);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        fetchAllDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCareer, userProfile]);

    // Proactive chatbot message
    useEffect(() => {
      if (selectedCareer) {
        const timer = setTimeout(() => {
          addChatMessage({ sender: 'ai', text: `I see you're exploring the path to become a ${selectedCareer.jobTitle}! How can I help you with this plan?`});
          useAppStore.setState({ isChatOpen: true });
        }, 1500);
        return () => clearTimeout(timer);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCareer]);

    if (!selectedCareer) return null;

    const modalContent = {
        skillGap: { title: 'Skill Gap Analysis', component: <SkillGapAnalysis /> },
        learningPath: { title: 'Personalized Learning Path', component: <LearningPath /> },
        outlook: { title: '5-Year Future Outlook', component: <FutureOutlook /> },
        jobs: { title: 'Live Job Opportunities', component: <LiveJobs /> },
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => setSelectedCareer(null)} className="flex items-center gap-2 text-brand-primary hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to Recommendations
                </button>
                 <button onClick={reset} className="px-4 py-2 text-sm bg-gray-600 text-text-secondary rounded-lg hover:bg-gray-500 hover:text-text-main transition-colors">
                    Logout
                </button>
            </div>

            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{selectedCareer.jobTitle}</h1>
                <p className="mt-2 text-text-secondary max-w-2xl mx-auto">{selectedCareer.reasoning}</p>
            </header>
            
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                <FeatureCard 
                    title="Skill Gap Analysis"
                    description="See the key skills you need to develop for this role."
                    icon={<ChartBarIcon />}
                    imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    onClick={() => setActiveModal('skillGap')}
                />
                <FeatureCard 
                    title="Personalized Learning Path"
                    description="Your step-by-step guide to acquiring new skills, complete with courses."
                    icon={<BookOpenIcon />}
                    imageUrl="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    onClick={() => setActiveModal('learningPath')}
                />
                <FeatureCard 
                    title="5-Year Future Outlook"
                    description="Explore demand, salary trends, and the impact of automation."
                    icon={<TrendingUpIcon />}
                    imageUrl="https://images.unsplash.com/photo-1534447677768-be436a0976f2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    onClick={() => setActiveModal('outlook')}
                />
                 <FeatureCard 
                    title="Live Job Opportunities"
                    description="Find current job openings from top companies right now."
                    icon={<BriefcaseIcon />}
                    imageUrl="https://images.unsplash.com/photo-1521737678948-698e25f8b934?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    onClick={() => setActiveModal('jobs')}
                />
            </div>
            
            <DetailModal 
                isOpen={activeModal !== null} 
                onClose={() => setActiveModal(null)} 
                title={activeModal ? modalContent[activeModal].title : ''}
            >
                {activeModal && modalContent[activeModal].component}
            </DetailModal>
        </div>
    );
};

export default CareerDetailView;