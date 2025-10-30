import React from 'react';
import useAppStore from '../hooks/useAppStore';
import RecommendationCard from './RecommendationCard';

const Dashboard: React.FC = () => {
  const { userProfile, recommendations, reset } = useAppStore();

  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-2">Welcome, {userProfile?.name}!</h1>
            <p className="text-lg text-text-secondary">Here are your personalized career recommendations, powered by AI.</p>
        </div>
        <button onClick={reset} className="px-4 py-2 text-sm bg-gray-600 text-text-secondary rounded-lg hover:bg-gray-500 hover:text-text-main transition-colors">
            Logout
        </button>
      </header>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} recommendation={rec} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;