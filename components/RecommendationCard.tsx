
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import useAppStore from '../hooks/useAppStore';
import { CareerRecommendation } from '../types';

interface RecommendationCardProps {
  recommendation: CareerRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const { setSelectedCareer } = useAppStore();

  const data = [
    { name: 'Match', value: recommendation.matchPercentage },
    { name: 'Gap', value: 100 - recommendation.matchPercentage },
  ];
  const COLORS = ['#8B5CF6', '#374151']; // brand-primary, gray-700

  return (
    <div 
      className="bg-bg-light p-6 rounded-xl border border-gray-700 flex flex-col cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-brand-primary/20"
      onClick={() => setSelectedCareer(recommendation)}
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-text-main mb-2 w-2/3">{recommendation.jobTitle}</h2>
          <div className="w-20 h-20 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={35}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-main">
              {recommendation.matchPercentage}%
            </div>
          </div>
        </div>
        <p className="text-text-secondary mb-4 text-sm">{recommendation.reasoning}</p>
        <div className="mb-4">
          <h4 className="font-semibold text-text-main mb-2">Key Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {recommendation.requiredSkills.slice(0, 5).map(skill => (
              <span key={skill} className="bg-gray-700 text-xs text-text-secondary px-2 py-1 rounded-full">{skill}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right text-brand-primary font-semibold hover:underline">
        View Details →
      </div>
    </div>
  );
};

export default RecommendationCard;
