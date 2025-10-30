import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                    Welcome to Proxima
                </h1>
                <p className="mt-2 text-lg text-text-secondary">Your personal AI Career Advisor</p>
            </div>
            <div className="w-full max-w-md bg-bg-light p-8 rounded-xl shadow-2xl border border-gray-700">
                {isLoginView ? (
                    <Login onSwitch={() => setIsLoginView(false)} />
                ) : (
                    <Signup onSwitch={() => setIsLoginView(true)} />
                )}
            </div>
        </div>
    );
};

export default AuthPage;
