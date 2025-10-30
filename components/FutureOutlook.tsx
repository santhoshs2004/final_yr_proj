import React from 'react';
import useAppStore from '../hooks/useAppStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const riskLevelMap = {
  High: { color: '#F87171', labelColor: 'text-red-400' }, // red-400
  Medium: { color: '#FBBF24', labelColor: 'text-amber-400' }, // amber-400
  Low: { color: '#34D399', labelColor: 'text-emerald-400' }, // emerald-400
};

const skillColors = [
    'border-sky-500/50 bg-sky-500/10 text-sky-300',
    'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
    'border-amber-500/50 bg-amber-500/10 text-amber-300',
    'border-rose-500/50 bg-rose-500/10 text-rose-300',
    'border-indigo-500/50 bg-indigo-500/10 text-indigo-300',
];

const FutureOutlook: React.FC = () => {
  const { careerDetails, isLoadingDetails } = useAppStore();
  const outlook = careerDetails.futureOutlook;

  if (isLoadingDetails && !outlook) {
     return (
        <div className="p-6">
             <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-6"></div>
                    <div className="flex justify-around">
                      <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
                      <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
                    </div>
                     <div className="h-4 bg-gray-700 rounded w-5/6 mt-6"></div>
                     <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                </div>
            </div>
        </div>
    );
  }

  if (!outlook) {
     return (
       <div className="p-6">
        <p className="text-text-secondary">Could not load future outlook data at this time.</p>
      </div>
    )
  }
  
  const riskData = [
    { name: 'Risk', value: outlook.automationRisk.percentage },
    { name: 'Safe', value: 100 - outlook.automationRisk.percentage },
  ];
  const riskColor = riskLevelMap[outlook.automationRisk.level]?.color || '#4B5563';

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-center">
        {/* Automation Risk Chart */}
        <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg">
            <h4 className="font-semibold text-text-secondary mb-2">Automation Risk</h4>
             <div className="w-28 h-28 relative">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={45}
                    fill="#8884d8"
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={450}
                    >
                        <Cell fill={riskColor} />
                        <Cell fill={'#374151'} />
                    </Pie>
                </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className={`text-2xl font-bold ${riskLevelMap[outlook.automationRisk.level]?.labelColor}`}>{outlook.automationRisk.percentage}%</span>
                     <span className="text-xs text-text-secondary">{outlook.automationRisk.level}</span>
                </div>
             </div>
             <p className="text-text-secondary text-xs mt-2">{outlook.automationRisk.commentary}</p>
        </div>

        {/* Salary Trend */}
        <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg">
            <h4 className="font-semibold text-text-secondary mb-2">Salary Trend</h4>
             <div className="w-28 h-28 flex flex-col items-center justify-center bg-gray-800/50 rounded-full border-2 border-gray-700">
                 <span className="text-3xl font-bold text-emerald-400 flex items-center">
                    +{outlook.salaryTrend.growthPercentage}%
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 11.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                 </span>
                 <span className="text-xs text-text-secondary">Growth</span>
            </div>
            <p className="text-text-secondary text-xs mt-2">{outlook.salaryTrend.commentary}</p>
        </div>
      </div>
      
      <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
        <div>
          <h4 className="font-semibold text-text-secondary">Projected Demand</h4>
          <p className="text-text-main">{outlook.fiveYearDemand}</p>
        </div>
        <div>
          <h4 className="font-semibold text-text-secondary">Skills on the Rise</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {outlook.newSkillsOnTheRise.map((skill, index) => (
              <span key={skill.skill} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${skillColors[index % skillColors.length]}`}>
                {skill.skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutureOutlook;