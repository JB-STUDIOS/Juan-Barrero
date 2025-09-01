export type InstrumentType = 'piano' | 'violin' | 'harp';

// Scale for instruments that are not fully chromatic in this implementation
export const DIATONIC_SCALE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];

// New chromatic scale for the piano
export interface ChromaticNote {
    note: string;
    type: 'white' | 'black';
}

export const CHROMATIC_SCALE: ChromaticNote[] = [
    { note: 'C4', type: 'white' }, { note: 'C#4', type: 'black' }, { note: 'D4', type: 'white' }, { note: 'D#4', type: 'black' }, { note: 'E4', type: 'white' },
    { note: 'F4', type: 'white' }, { note: 'F#4', type: 'black' }, { note: 'G4', type: 'white' }, { note: 'G#4', type: 'black' }, { note: 'A4', type: 'white' }, { note: 'A#4', type: 'black' }, { note: 'B4', type: 'white' },
    { note: 'C5', type: 'white' }, { note: 'C#5', type: 'black' }, { note: 'D5', type: 'white' }, { note: 'D#5', type: 'black' }, { note: 'E5', type: 'white' },
    { note: 'F5', type: 'white' }, { note: 'F#5', type: 'black' }, { note: 'G5', type: 'white' }, { note: 'G#5', type: 'black' }, { note: 'A5', type: 'white' }, { note: 'A#5', type: 'black' }, { note: 'B5', type: 'white' },
    { note: 'C6', type: 'white' },
];
