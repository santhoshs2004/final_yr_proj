import React, { useState } from 'react';
import { signUpWithEmail } from '../../services/firebaseService';
import { FirebaseError } from 'firebase/app';

interface SignupProps {
    onSwitch: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await signUpWithEmail(email, password);
        } catch (e) {
            const error = e as FirebaseError;
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists. Please sign in.');
            } else if (error.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters long.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            }
             else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-text-main mb-6">Create Account</h2>
            {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">{error}</p>}
            <form onSubmit={handleEmailSignup} className="space-y-4">
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
                    placeholder="Password (at least 6 characters)"
                    required
                    className="w-full bg-bg-dark p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                 <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="w-full bg-bg-dark p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign Up'}
                </button>
            </form>
            <p className="text-center text-sm text-text-secondary mt-6">
                Already have an account?{' '}
                <button onClick={onSwitch} className="font-semibold text-brand-primary hover:underline">
                    Sign In
                </button>
            </p>
        </div>
    );
};

export default Signup;
