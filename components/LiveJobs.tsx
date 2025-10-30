import React from 'react';
import useAppStore from '../hooks/useAppStore';
import { JobPosting } from '../types';

const LiveJobs: React.FC = () => {
  const { careerDetails, isLoadingDetails } = useAppStore();
  const jobs = careerDetails.liveJobs;

  if (isLoadingDetails && !jobs) {
    return (
        <div className="p-6">
             <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                    <div className="h-12 bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    );
  }

  if (!jobs || jobs.postings.length === 0) {
    return (
      <div className="p-6 text-center text-text-secondary">
          <p>No recent job postings could be found at this time.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {jobs.postings.map((job: JobPosting, index: number) => (
          <a
            key={index}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <p className="font-bold text-text-main truncate">{job.title}</p>
            <p className="text-sm text-text-secondary">{job.company}</p>
          </a>
        ))}
      </div>
      {jobs.sources && jobs.sources.length > 0 && (
          <div className="mt-6">
              <h4 className="text-sm font-semibold text-text-secondary mb-2">Sources from Google Search:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs">
                  {jobs.sources.map((source, index) => (
                      source.web?.uri && (
                        <li key={index}>
                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline truncate block">
                                {source.web.title}
                            </a>
                        </li>
                      )
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};

export default LiveJobs;