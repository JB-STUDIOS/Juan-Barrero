
import React from 'react';

interface StartScreenProps {
    onStart: () => void;
    isInitializing: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, isInitializing }) => {
    return (
        <div 
            id="start-screen" 
            className={`absolute inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ${isInitializing ? 'cursor-wait' : 'cursor-pointer'}`}
            onClick={isInitializing ? undefined : onStart}
        >
            <div className="text-center p-8 border-2 border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20">
                <h1 className="title-font text-5xl md:text-7xl font-bold text-purple-400 mb-4">SINFONÍA IA</h1>
                {isInitializing ? (
                    <>
                        <p className="text-lg text-gray-300 mb-8">Initializing Sonic Environment...</p>
                        <div className="w-16 h-16 mx-auto border-4 border-t-transparent border-purple-400 rounded-full animate-spin"></div>
                    </>
                ) : (
                    <>
                        <p className="text-lg text-gray-300 mb-8">Tap to start the sonic experience</p>
                        <div className="w-16 h-16 mx-auto border-4 border-purple-400 rounded-full animate-ping"></div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StartScreen;