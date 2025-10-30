import React, { useState } from 'react';
import useAppStore from '../hooks/useAppStore';
import { getCareerRecommendations } from '../services/geminiService';
import { UserProfile } from '../types';
import BriefcaseIcon from './icons/BriefcaseIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker source from a CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

const quizQuestions = [
  {
    id: 'q1',
    question: '1. When facing a complex problem, you prefer to:',
    options: [
      { value: 'A', text: 'Analyze data and find a logical solution' },
      { value: 'B', text: 'Brainstorm creative and unconventional ideas' },
      { value: 'C', text: 'Organize a team and delegate tasks' },
      { value: 'D', text: 'Experiment with hands-on trial and error' },
    ],
  },
  {
    id: 'q2',
    question: '2. You feel most energized in a work environment that is:',
    options: [
      { value: 'A', text: 'Structured and predictable' },
      { value: 'B', text: 'Dynamic and fast-paced' },
      { value: 'C', text: 'Collaborative and team-oriented' },
      { value: 'D', text: 'Independent and autonomous' },
    ],
  },
  {
    id: 'q3',
    question: '3. Which of these tasks sounds most appealing?',
    options: [
        { value: 'A', text: 'Building a financial model' },
        { value: 'B', text: 'Designing a marketing campaign' },
        { value: 'C', text: 'Improving an internal process' },
        { value: 'D', text: 'Mentoring a junior colleague' },
    ],
  },
   {
    id: 'q4',
    question: '4. Your ideal project would involve:',
    options: [
        { value: 'A', text: 'Working with concrete numbers and facts' },
        { value: 'B', text: 'Creating something visually beautiful or emotionally resonant' },
        { value: 'C', text: 'Leading a project from start to finish' },
        { value: 'D', text: 'Solving a tangible, real-world problem' },
    ],
  },
   {
    id: 'q5',
    question: '5. When learning a new skill, you prefer:',
    options: [
        { value: 'A', text: 'Reading books and theoretical articles' },
        { value: 'B', text: 'Watching tutorials and online courses' },
        { value: 'C', text: 'Jumping in and learning by doing' },
        { value: 'D', text: 'Discussing concepts with a mentor or peer' },
    ],
  },
    {
    id: 'q6',
    question: '6. You are more of a:',
    options: [
        { value: 'A', text: 'Big-picture thinker' },
        { value: 'B', text: 'Detail-oriented specialist' },
    ],
  },
  {
    id: 'q7',
    question: "7. You'd rather work on a project that is:",
    options: [
        { value: 'A', text: 'Technically challenging but with a clear goal' },
        { value: 'B', text: 'Creatively open-ended but with an ambiguous outcome' },
    ],
  },
  {
    id: 'q8',
    question: '8. Success for you is more about:',
    options: [
        { value: 'A', text: 'Achieving measurable results and hitting targets' },
        { value: 'B', text: 'Creating innovative work that inspires others' },
        { value: 'C', text: 'Building strong relationships and a positive team culture' },
        { value: 'D', text: "Mastering a difficult craft or skill" },
    ],
  },
  {
    id: 'q9',
    question: '9. In a team, you naturally take on the role of:',
    options: [
        { value: 'A', text: 'The Analyst (providing data and insights)' },
        { value: 'B', text: 'The Visionary (generating new ideas)' },
        { value: 'C', text: 'The Organizer (planning and coordinating)' },
        { value: 'D', text: 'The Builder (executing and creating)' },
    ],
  },
  {
    id: 'q10',
    question: "10. Looking five years into the future, you'd like to be seen as:",
    options: [
        { value: 'A', text: 'An expert in a specific field' },
        { value: 'B', text: 'An innovative leader' },
        { value: 'C', text: 'A reliable and effective manager' },
        { value: 'D', text: 'A creative trailblazer' },
    ],
  }
];

interface OnboardingWizardProps {
    isAnalyzing: boolean;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isAnalyzing }) => {
    const { setUserProfile, setRecommendations, setIsAnalyzing } = useAppStore();
    const [step, setStep] = useState(1);
    const [isParsing, setIsParsing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        resumeText: '',
        githubUrl: '',
        leetcodeUrl: '',
        interests: '',
        personalityQuizAnswers: {} as Record<string, string>,
    });

    const handleNext = () => setStep(s => Math.min(s + 1, 5));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
            setFormData(prev => ({ ...prev, resumeText: fullText.trim() }));
        } catch (error) {
            console.error('Error parsing PDF:', error);
            alert('There was an error reading the PDF file. Please try pasting the text instead.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleQuizChange = (questionId: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            personalityQuizAnswers: {
                ...prev.personalityQuizAnswers,
                [questionId]: value,
            }
        }));
    };

    const handleSubmit = async () => {
        setIsAnalyzing(true);
        const userProfile: UserProfile = { ...formData };
        setUserProfile(userProfile);
        
        try {
            const recommendations = await getCareerRecommendations(userProfile);
            if (recommendations) {
                setRecommendations(recommendations);
            } else {
                alert("Sorry, we couldn't generate recommendations. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            alert("An error occurred. Please check your connection or API key and try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const totalSteps = 5;
    const progress = (step / totalSteps) * 100;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-text-main mb-2">Welcome to Proxima</h2>
                        <p className="text-text-secondary mb-6">Let's start with the basics. What's your full name?</p>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Jane Doe" className="w-full bg-bg-light p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
                    </div>
                );
            case 2:
                return (
                     <div>
                        <h2 className="text-2xl font-bold text-text-main mb-2">Your Professional Story</h2>
                         <p className="text-text-secondary mb-6">Upload your resume (PDF, max 5MB) or paste the text below. The AI will analyze the content from either source.</p>
        
                        <div className="mb-4">
                            <label htmlFor="resume-upload" className="sr-only">Choose file</label>
                            <input 
                                type="file" 
                                name="resumeFile"
                                id="resume-upload"
                                accept=".pdf"
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/20 file:text-brand-primary hover:file:bg-brand-primary/30"
                                onChange={handleFileChange}
                                disabled={isParsing}
                            />
                        </div>
                        
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-600" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-bg-light px-2 text-sm text-gray-400">OR</span>
                            </div>
                        </div>

                        <textarea 
                            name="resumeText" 
                            value={formData.resumeText} 
                            onChange={handleChange} 
                            placeholder={isParsing ? "Parsing PDF, please wait..." : "Paste your full resume text here, or upload a PDF."} 
                            className="w-full h-48 bg-bg-light p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            readOnly={isParsing}
                        />
                    </div>
                );
            case 3:
                return (
                     <div>
                        <h2 className="text-2xl font-bold text-text-main mb-2">Coding Profiles (Optional)</h2>
                        <p className="text-text-secondary mb-6">Help us get a better sense of your technical skills.</p>
                        <input type="text" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="GitHub Profile URL" className="w-full bg-bg-light p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none mb-4"/>
                        <input type="text" name="leetcodeUrl" value={formData.leetcodeUrl} onChange={handleChange} placeholder="LeetCode Profile URL" className="w-full bg-bg-light p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
                    </div>
                );
            case 4: 
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-text-main mb-2">Personality Quiz (Optional)</h2>
                        <p className="text-text-secondary mb-6">Your answers help us understand your work style and preferences.</p>
                        <div className="space-y-6 max-h-80 overflow-y-auto pr-4">
                            {quizQuestions.map(q => (
                                <div key={q.id}>
                                    <p className="font-semibold text-text-main mb-2">{q.question}</p>
                                    <div className="space-y-2">
                                        {q.options.map(opt => (
                                            <label key={opt.value} className="flex items-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={opt.value}
                                                    checked={formData.personalityQuizAnswers[q.id] === opt.value}
                                                    onChange={() => handleQuizChange(q.id, opt.value)}
                                                    className="w-4 h-4 text-brand-primary bg-gray-700 border-gray-600 focus:ring-brand-primary ring-offset-bg-light"
                                                />
                                                <span className="ml-3 text-text-secondary">{opt.text}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                     <div>
                        <h2 className="text-2xl font-bold text-text-main mb-2">Professional Interests</h2>
                        <p className="text-text-secondary mb-6">What fields or technologies are you passionate about? (Separate with commas)</p>
                        <input type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., Machine Learning, UI/UX Design, Cloud Computing" className="w-full bg-bg-light p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Proxima: Your AI Career Navigator</h1>
                <p className="mt-4 text-lg text-text-secondary">Unlock your potential with personalized career guidance.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12 text-center">
                 <div className="bg-bg-light p-6 rounded-lg border border-gray-700 transform hover:scale-105 transition-transform duration-300">
                    <LightBulbIcon className="mx-auto h-12 w-12 text-brand-primary mb-4"/>
                    <h3 className="text-xl font-bold text-text-main">AI Recommendations</h3>
                    <p className="text-text-secondary mt-2">Discover career paths perfectly aligned with your skills and interests.</p>
                </div>
                <div className="bg-bg-light p-6 rounded-lg border border-gray-700 transform hover:scale-105 transition-transform duration-300">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-brand-primary mb-4"/>
                    <h3 className="text-xl font-bold text-text-main">Personalized Learning</h3>
                    <p className="text-text-secondary mt-2">Get a step-by-step plan to bridge your skill gaps and achieve your goals.</p>
                </div>
                <div className="bg-bg-light p-6 rounded-lg border border-gray-700 transform hover:scale-105 transition-transform duration-300">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-brand-primary mb-4"/>
                    <h3 className="text-xl font-bold text-text-main">Future Career Outlook</h3>
                    <p className="text-text-secondary mt-2">Stay ahead with insights into industry trends, demand, and automation risks.</p>
                </div>
            </div>
            
             <div className="bg-bg-light/50 p-6 rounded-lg border border-gray-700 mb-12">
                <h3 className="text-xl font-bold text-text-main text-center mb-3">How Proxima Works</h3>
                <p className="text-text-secondary text-sm text-center max-w-3xl mx-auto">
                    Resume analysis and job recommendation systems use AI to extract skills, education, and experience from a resume and match them with suitable job openings. These systems employ techniques like Natural Language Processing (NLP) to understand the text, and algorithms to rank job matches. By automating this process, they help job seekers find relevant opportunities faster and assist employers in efficiently sifting through applications.
                </p>
            </div>

            <div className="bg-bg-light p-8 rounded-xl shadow-2xl border border-gray-700">
                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-brand-primary">Step {step} of {totalSteps}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                    </div>
                </div>

                <div className="min-h-[200px]">
                    {renderStep()}
                </div>
                
                <div className="flex justify-between mt-8">
                    <button onClick={handleBack} disabled={step === 1 || isAnalyzing || isParsing} className="px-6 py-2 bg-gray-600 text-text-main rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Back</button>
                    {step < totalSteps ? (
                        <button onClick={handleNext} disabled={isAnalyzing || isParsing} className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50">Next</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isAnalyzing || isParsing} className="px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center min-w-[150px] disabled:opacity-70">
                             {isAnalyzing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </>
                            ) : (
                                'Finish & Analyze'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;