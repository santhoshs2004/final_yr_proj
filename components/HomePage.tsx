import React, { useState, useEffect } from 'react';
import useAppStore from '../hooks/useAppStore';
import * as pdfjsLib from 'pdfjs-dist';
import { getAuth } from 'firebase/auth';
import { getCareerRecommendations } from '../services/geminiService';
import { UserProfile } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

const stageColorMap = {
  Beginner: 'bg-sky-500/20 text-sky-400',
  Intermediate: 'bg-emerald-500/20 text-emerald-400',
  Advanced: 'bg-amber-500/20 text-amber-400',
  Expert: 'bg-rose-500/20 text-rose-400',
};

const HomePage: React.FC = () => {
    // FIX: Destructure existing state and actions from the app store.
    const { 
        userProfile,
        recommendations, 
        isAnalyzing, 
        reset,
        setUserProfile,
        setRecommendations,
        setIsAnalyzing 
    } = useAppStore();
    const [resumeText, setResumeText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        if(userProfile?.resumeText) {
            setResumeText(userProfile.resumeText);
        }
    }, [userProfile?.resumeText]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size should not exceed 5MB.');
            e.target.value = '';
            return;
        }
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            e.target.value = '';
            return;
        }
        
        setIsParsing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // We have to explicitly type the item as any because the type definition from pdfjs-dist is not perfect
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
            }
            setResumeText(fullText.trim());
        } catch (error) {
            console.error('Error parsing PDF:', error);
            alert('There was an error reading the PDF. Please paste the text instead.');
        } finally {
            setIsParsing(false);
        }
    };
    
    // FIX: Implement submit handler using existing store actions to update resume and fetch new recommendations.
    const handleSubmit = async () => {
        if (!resumeText.trim()) {
            alert("Please provide your resume text or upload a PDF.");
            return;
        }
        if (!userProfile) {
            alert("Cannot update recommendations without an existing user profile.");
            return;
        }
        
        setIsAnalyzing(true);
        const updatedProfile: UserProfile = { ...userProfile, resumeText: resumeText };
        setUserProfile(updatedProfile);

        try {
            const newRecommendations = await getCareerRecommendations(updatedProfile);
            if (newRecommendations) {
                setRecommendations(newRecommendations);
            } else {
                 alert("Sorry, we couldn't generate new recommendations. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching new recommendations:", error);
            alert("An error occurred while analyzing your updated resume.");
        } finally {
            setIsAnalyzing(false);
        }
    }
    
    return (
        <div>
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-text-main">
                    Proxima Dashboard
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-text-secondary text-sm hidden sm:block">{auth.currentUser?.email}</span>
                    <button onClick={reset} className="px-4 py-2 text-sm bg-gray-600 text-text-secondary rounded-lg hover:bg-gray-500 hover:text-text-main transition-colors">
                        Logout
                    </button>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Resume Input Section */}
                <div className="bg-bg-light p-8 rounded-xl shadow-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-text-main mb-2">Analyze Your Resume</h2>
                    <p className="text-text-secondary mb-6">Upload or paste your resume to get an instant AI-powered analysis of your career stage.</p>
                    
                    <div className="mb-4">
                        <label htmlFor="resume-upload" className="sr-only">Choose file</label>
                        <input 
                            type="file" 
                            id="resume-upload"
                            accept=".pdf"
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/20 file:text-brand-primary hover:file:bg-brand-primary/30"
                            onChange={handleFileChange}
                            disabled={isParsing || isAnalyzing}
                        />
                    </div>
                    
                    <textarea 
                        value={resumeText} 
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder={isParsing ? "Reading PDF..." : "Paste your full resume text here..."} 
                        className="w-full h-48 bg-bg-dark p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        readOnly={isParsing || isAnalyzing}
                    />

                    <button onClick={handleSubmit} disabled={isAnalyzing || isParsing} className="mt-4 w-full bg-brand-secondary text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center min-h-[48px] disabled:opacity-70">
                         {isAnalyzing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : 'Analyze Now'}
                    </button>
                </div>

                {/* Analysis Result Section */}
                <div className="bg-bg-light p-8 rounded-xl border border-gray-700">
                     <h2 className="text-2xl font-bold text-text-main mb-6">Your Career Snapshot</h2>
                      {/* FIX: Display career recommendations from the store instead of the non-existent resumeAnalysis. */}
                     {recommendations && recommendations.length > 0 ? (
                        <div className="space-y-4 animate-fade-in">
                            {recommendations.map((rec) => (
                                <div key={rec.jobTitle} className="p-4 bg-bg-dark rounded-lg border border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-text-main">{rec.jobTitle}</h3>
                                        <span className={`text-sm font-bold px-3 py-1 rounded-full inline-block bg-brand-primary/20 text-brand-primary`}>
                                            {rec.matchPercentage}% Match
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-2">{rec.reasoning}</p>
                                    <div className="mt-3">
                                        <h4 className="text-xs font-semibold text-text-secondary mb-1">Key Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.requiredSkills.map(skill => (
                                                <span key={skill} className="bg-gray-700 text-xs text-text-secondary px-2.5 py-1 rounded-full">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-text-secondary text-center">Your analysis results will appear here once you submit your resume.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;