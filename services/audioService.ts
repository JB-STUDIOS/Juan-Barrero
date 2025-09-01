import * as Tone from 'tone';
import { InstrumentType } from '../types';

// Allow for different types of instruments, since PluckSynth is not a PolySynth
let synths: { [key in InstrumentType]?: Tone.PolySynth | Tone.PluckSynth } = {};
let currentSynth: Tone.PolySynth | Tone.PluckSynth | null = null;
let activeNotes: { [id: string]: string } = {};

export const initializeAudio = async () => {
    await Tone.start();
    console.log('Audio context started');

    const reverb = new Tone.Reverb(3.5).toDestination();
    const delay = new Tone.FeedbackDelay("8n", 0.3).connect(reverb);

    // Use the new Tone.PolySynth(Voice, options) syntax which is more robust in v15
    synths.piano = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.01,
        modulationIndex: 14,
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 1.2 },
    }).connect(delay);
    synths.piano.volume.value = -6;

    synths.violin = new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 1.5,
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.6, decay: 0.3, sustain: 0.6, release: 1.5 },
    }).connect(delay);
    synths.violin.volume.value = -8;

    // PluckSynth is already polyphonic and is not a Monophonic voice, so it should not be used with PolySynth.
    // Instantiate it directly.
    synths.harp = new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 6000,
        resonance: 0.95,
    }).connect(delay);
    synths.harp.volume.value = -4;


    currentSynth = synths.piano;
};

export const setInstrument = (instrument: InstrumentType) => {
    releaseAllNotes();
    currentSynth = synths[instrument] || null;
};

export const playNote = (note: string, id: string) => {
    if (currentSynth) {
        currentSynth.triggerAttack(note, Tone.now());
        activeNotes[id] = note;
    }
};

export const releaseNote = (id: string) => {
    if (currentSynth && activeNotes[id]) {
        // PolySynth can release specific notes.
        if (currentSynth instanceof Tone.PolySynth) {
            currentSynth.triggerRelease([activeNotes[id]], Tone.now() + 0.1);
        }
        // For other instruments like PluckSynth, the note decays naturally.
        // We just remove it from our active list.
        delete activeNotes[id];
    }
};

export const releaseAllNotes = () => {
    Object.keys(activeNotes).forEach(id => {
        releaseNote(id);
    });
};

export const getActiveNotes = (): { [id: string]: string } => {
    return activeNotes;
};
