
import React from 'react';
import { InstrumentType } from '../types';

interface InstrumentSelectorProps {
    currentInstrument: InstrumentType;
    onInstrumentChange: (instrument: InstrumentType) => void;
}

const instruments: { id: InstrumentType; name: string }[] = [
    { id: 'piano', name: 'Neon Piano' },
    { id: 'violin', name: 'Plasma Violin' },
    { id: 'harp', name: 'Photon Harp' },
];

const InstrumentButton: React.FC<{
    instrumentId: InstrumentType,
    name: string,
    isActive: boolean,
    onClick: (id: InstrumentType) => void
}> = ({ instrumentId, name, isActive, onClick }) => {
    const activeClasses = 'bg-purple-800/50 border-purple-500 shadow-lg shadow-purple-500/40 text-white';
    const inactiveClasses = 'text-gray-300 border-purple-800/50 hover:bg-purple-800/30 hover:border-purple-600/70';

    return (
        <button
            onClick={() => onClick(instrumentId)}
            className={`title-font py-3 px-6 rounded-full text-lg transition-all duration-300 ease-in-out border text-shadow ${isActive ? activeClasses : inactiveClasses}`}
            style={{ textShadow: '0 0 5px rgba(138, 43, 226, 0.5)' }}
        >
            {name}
        </button>
    );
};


const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({ currentInstrument, onInstrumentChange }) => {
    return (
        <div className="flex justify-center items-center gap-2 md:gap-4 my-6">
            {instruments.map(({ id, name }) => (
                <InstrumentButton
                    key={id}
                    instrumentId={id}
                    name={name}
                    isActive={currentInstrument === id}
                    onClick={onInstrumentChange}
                />
            ))}
        </div>
    );
};

export default InstrumentSelector;
