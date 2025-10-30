import React, { useState } from 'react';
import { signInWithEmail } from '../../services/firebaseService';
import { FirebaseError } from 'firebase/app';

interface LoginProps {
    onSwitch: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmail(email, password);
        } catch (e) {
            const error = e as FirebaseError;
            if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError('Failed to sign in. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-text-main mb-6">Sign In</h2>
            {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">{error}</p>}
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full bg-bg-dark p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-bg-dark p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign In'}
                </button>
            </form>
            <p className="text-center text-sm text-text-secondary mt-6">
                Don't have an account?{' '}
                <button onClick={onSwitch} className="font-semibold text-brand-primary hover:underline">
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default Login;
