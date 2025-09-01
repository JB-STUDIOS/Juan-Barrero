
import React, { useState, useCallback, useRef } from 'react';
import StartScreen from './components/StartScreen';
import InstrumentSelector from './components/InstrumentSelector';
import MusicCanvas from './components/MusicCanvas';
import { InstrumentType } from './types';
import * as AudioService from './services/audioService';

const App: React.FC = () => {
    const [audioReady, setAudioReady] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(false);
    const [currentInstrument, setCurrentInstrument] = useState<InstrumentType>('piano');
    const mainContainerRef = useRef<HTMLElement>(null);

    const handleStart = useCallback(async () => {
        if (audioReady || isInitializing) return;

        setIsInitializing(true);
        try {
            await AudioService.initializeAudio();
            AudioService.setInstrument(currentInstrument);
            setAudioReady(true);
        } catch (error) {
            console.error("Failed to initialize audio:", error);
            alert("Could not initialize the audio experience. Please refresh and try again.");
        } finally {
            setIsInitializing(false);
        }
    }, [audioReady, isInitializing, currentInstrument]);

    const handleInstrumentChange = useCallback((instrument: InstrumentType) => {
        setCurrentInstrument(instrument);
        if (audioReady) {
            AudioService.setInstrument(instrument);
        }
    }, [audioReady]);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-radial-gradient">
            {!audioReady && <StartScreen onStart={handleStart} isInitializing={isInitializing} />}
            
            <div className={`w-full h-full max-w-6xl mx-auto flex flex-col z-10 ${!audioReady ? 'hidden' : ''}`}>
                <header className="text-center p-4">
                    <h1 className="title-font text-4xl font-bold tracking-widest text-purple-300">SINFONÍA IA</h1>
                    <p className="text-gray-400">Select an instrument and create your melody</p>
                </header>

                <InstrumentSelector
                    currentInstrument={currentInstrument}
                    onInstrumentChange={handleInstrumentChange}
                />

                <main id="instrument-container" ref={mainContainerRef} className="w-full flex-grow relative">
                    {audioReady && <MusicCanvas instrument={currentInstrument} containerRef={mainContainerRef} />}
                </main>
            </div>
        </div>
    );
};

export default App;
