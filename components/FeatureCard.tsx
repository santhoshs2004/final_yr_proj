import React from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    imageUrl: string;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, imageUrl, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="relative h-64 rounded-xl overflow-hidden cursor-pointer group p-6 flex flex-col justify-end border border-gray-700/50"
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
                style={{ backgroundImage: `url(${imageUrl})` }}
            ></div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
            
            <div className="relative z-10 text-white transition-transform duration-300 ease-in-out group-hover:-translate-y-2">
                 <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3 text-brand-primary">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out max-w-xs">{description}</p>
            </div>
        </div>
    );
};

export default FeatureCard;