import React from 'react';
import useAppStore from '../hooks/useAppStore';

const LearningPath: React.FC = () => {
    const { careerDetails, learningProgress, toggleLearningStep, isLoadingDetails } = useAppStore();
    const learningPath = careerDetails.learningPath;
    const skillGap = careerDetails.skillGap;

    if (isLoadingDetails && !learningPath) {
        return (
            <div className="p-6">
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="space-y-2 mt-6">
                            <div className="h-20 bg-gray-700 rounded"></div>
                            <div className="h-20 bg-gray-700 rounded"></div>
                            <div className="h-20 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!learningPath || learningPath.path.length === 0) {
        return (
            <div className="p-6">
                <p className="text-text-secondary text-center py-4">
                    {skillGap && skillGap.missingSkills.length === 0 
                        ? "No specific learning path is needed as you already possess the key skills for this role. Well done!"
                        : "A learning path could not be generated. This can happen if no skill gaps were identified or the AI could not create a plan."
                    }
                </p>
            </div>
        );
    }

    const completedSteps = Object.values(learningProgress).filter(Boolean).length;
    const totalSteps = learningPath.path.length;
    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    return (
        <div className="p-6">
            <p className="text-text-secondary mb-6">Estimated time to completion: <span className="font-semibold text-brand-primary">{learningPath.estimatedTimeToCompletion}</span></p>

            {/* Progress Tracker */}
            <div className="mb-8">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-text-main">Your Progress</span>
                    <span className="text-sm font-medium text-text-main">{completedSteps} / {totalSteps} Steps Completed</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative border-l-2 border-gray-700 ml-3">
                {learningPath.path.map((step, index) => (
                    <div key={index} className="mb-10 ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-brand-primary rounded-full -left-3 ring-8 ring-bg-light">
                           <svg className="w-3 h-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/>
                                <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                            </svg>
                        </span>
                        <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="flex items-center text-lg font-semibold text-text-main">
                                    {step.title}
                                    <span className="bg-brand-primary/20 text-brand-primary text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">{step.duration}</span>
                                </h4>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={!!learningProgress[step.title]} onChange={() => toggleLearningStep(step.title)} className="sr-only peer" />
                                    <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/50 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-300">Done</span>
                                </label>
                            </div>
                            
                            <p className="text-sm font-semibold text-text-secondary mb-2 mt-4">Learning Objectives:</p>
                            <ul className="list-disc list-inside text-text-secondary space-y-1 mb-4">
                                {step.learningObjectives.map((obj, i) => (
                                    <li key={i}>
                                        {obj.description}
                                        {obj.link && (
                                            <a href={obj.link} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline text-xs ml-1">[Course Link]</a>
                                        )}
                                    </li>
                                ))}
                            </ul>

                             <p className="text-sm font-semibold text-text-secondary mb-2">Project Suggestion:</p>
                            <p className="text-text-secondary">{step.projectSuggestion}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LearningPath;