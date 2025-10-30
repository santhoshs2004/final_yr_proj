
import React, { useState, useEffect, useRef } from 'react';
import useAppStore from '../hooks/useAppStore';
import { startChat, streamChatResponse } from '../services/geminiService';
import { Chat } from '@google/genai';

const Chatbot: React.FC = () => {
    const { isChatOpen, toggleChat, chatHistory, addChatMessage, updateLastChatMessage } = useAppStore();
    const [userInput, setUserInput] = useState('');
    const [chatInstance, setChatInstance] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setChatInstance(startChat());
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [chatHistory]);

    const handleSend = async () => {
        if (!userInput.trim() || !chatInstance) return;

        const messageText = userInput;
        addChatMessage({ sender: 'user', text: messageText });
        setUserInput('');
        
        addChatMessage({ sender: 'ai', text: '' }); // Add empty AI message
        
        await streamChatResponse(chatInstance, messageText, (chunk) => {
            updateLastChatMessage(chunk);
        });
    };

    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 bg-brand-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform z-50"
                aria-label="Toggle Chatbot"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
            </button>
            
            {isChatOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-bg-light rounded-xl shadow-2xl flex flex-col z-40 border border-gray-700 animate-slide-up">
                    <header className="p-4 bg-gray-800 rounded-t-xl flex justify-between items-center border-b border-gray-700">
                        <h3 className="text-lg font-bold text-text-main">Proxima AI Assistant</h3>
                        <button onClick={toggleChat} className="text-text-secondary hover:text-text-main">&times;</button>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-brand-primary flex-shrink-0"></div>}
                                    <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-gray-700 text-text-main rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask anything..."
                                className="flex-grow bg-gray-700 text-text-main p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <button onClick={handleSend} className="bg-brand-primary text-white px-4 rounded-lg hover:bg-violet-700 transition-colors">Send</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
