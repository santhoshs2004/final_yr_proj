import React from 'react';
import useAppStore from '../hooks/useAppStore';

const importanceColorMap = {
  High: 'bg-red-500/20 text-red-400 border border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  Low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const SkillGapAnalysis: React.FC = () => {
  const { careerDetails, isLoadingDetails } = useAppStore();
  const skillGap = careerDetails.skillGap;

  if (isLoadingDetails && !skillGap) {
    return (
        <div className="p-6">
             <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    </div>
                     <div className="space-y-2 mt-4">
                        <div className="h-8 bg-gray-700 rounded"></div>
                        <div className="h-8 bg-gray-700 rounded"></div>
                        <div className="h-8 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (!skillGap) {
    return (
       <div className="p-6">
        <p className="text-text-secondary">Could not load skill gap analysis at this time. The AI may not have been able to process the request.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <p className="text-text-secondary mb-6">{skillGap.summary}</p>
      <div className="space-y-3">
        {skillGap.missingSkills.map((item) => (
          <div key={item.skill} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
            <span className="text-text-main font-medium">{item.skill}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${importanceColorMap[item.importance]}`}>
              {item.importance}
            </span>
          </div>
        ))}
        {skillGap.missingSkills.length === 0 && (
          <p className="text-center text-text-secondary py-4">No significant skill gaps identified. Great job!</p>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalysis;