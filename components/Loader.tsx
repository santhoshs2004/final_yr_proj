
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-bg-dark bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-bg-light border-t-brand-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-text-secondary animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;
