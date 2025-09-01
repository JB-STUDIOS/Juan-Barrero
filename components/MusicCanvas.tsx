import React, { useRef, useEffect, useCallback } from 'react';
import * as AudioService from '../services/audioService';
import { InstrumentType, CHROMATIC_SCALE, DIATONIC_SCALE, ChromaticNote } from '../types';
import { useParticles } from '../hooks/useParticles';

interface MusicCanvasProps {
    instrument: InstrumentType;
    containerRef: React.RefObject<HTMLElement>;
}

const drawPiano = (ctx: CanvasRenderingContext2D, activeNotes: { [id: string]: string }) => {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);

    const whiteKeys = CHROMATIC_SCALE.filter(k => k.type === 'white');
    const blackKeys = CHROMATIC_SCALE.filter(k => k.type === 'black');
    const whiteKeyWidth = width / whiteKeys.length;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = height * 0.6;

    // Draw white keys first
    let whiteKeyIndex = 0;
    CHROMATIC_SCALE.forEach((key, index) => {
        if (key.type === 'white') {
            const keyId = `key-${index}`;
            const isActive = !!activeNotes[keyId];
            const x = whiteKeyIndex * whiteKeyWidth;

            ctx.fillStyle = isActive ? 'rgba(138, 43, 226, 0.6)' : '#fdfdfd';
            ctx.strokeStyle = isActive ? '#fff' : '#888';
            ctx.lineWidth = 1;
            ctx.shadowColor = 'rgba(138, 43, 226, 0.8)';
            ctx.shadowBlur = isActive ? 30 : 0;
            
            ctx.fillRect(x, 0, whiteKeyWidth, height);
            ctx.strokeRect(x, 0, whiteKeyWidth, height);

            whiteKeyIndex++;
        }
    });
    
    // Draw black keys on top
    whiteKeyIndex = 0;
    CHROMATIC_SCALE.forEach((key, index) => {
        if (key.type === 'white') {
            whiteKeyIndex++;
        } else { // Black key
            const keyId = `key-${index}`;
            const isActive = !!activeNotes[keyId];
            const x = whiteKeyIndex * whiteKeyWidth - blackKeyWidth / 2;

            ctx.fillStyle = isActive ? 'rgba(138, 43, 226, 0.8)' : '#333';
            ctx.strokeStyle = isActive ? '#fff' : '#000';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(138, 43, 226, 0.9)';
            ctx.shadowBlur = isActive ? 25 : 0;

            ctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);
            ctx.strokeRect(x, 0, blackKeyWidth, blackKeyHeight);
        }
    });

    ctx.shadowBlur = 0;
};


const drawViolin = (ctx: CanvasRenderingContext2D, activeNotes: { [id: string]: string }) => {
    const { width: w, height: h } = ctx.canvas;
    ctx.clearRect(0, 0, w, h);
    const stringCount = 4;
    
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.5)';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(138, 43, 226, 1)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 0);
    ctx.bezierCurveTo(w * 0.2, h * 0.2, w * 0.2, h * 0.8, w * 0.4, h);
    ctx.bezierCurveTo(w * 0.3, h * 0.7, w * 0.3, h * 0.3, w * 0.4, 0);
    ctx.moveTo(w * 0.6, 0);
    ctx.bezierCurveTo(w * 0.8, h * 0.2, w * 0.8, h * 0.8, w * 0.6, h);
    ctx.bezierCurveTo(w * 0.7, h * 0.7, w * 0.7, h * 0.3, w * 0.6, 0);
    ctx.stroke();

    for (let i = 0; i < stringCount; i++) {
        const stringId = `string-${i}`;
        const isActive = !!activeNotes[stringId];
        const x = (w / (stringCount + 1)) * (i + 1);

        ctx.strokeStyle = isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(138, 43, 226, 0.8)';
        ctx.lineWidth = isActive ? 6 : 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
};

const drawHarp = (ctx: CanvasRenderingContext2D, activeNotes: { [id: string]: string }) => {
    const { width: w, height: h } = ctx.canvas;
    ctx.clearRect(0, 0, w, h);
    const stringCount = DIATONIC_SCALE.length;
    const centerX = w / 2;
    
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.7)';
    ctx.lineWidth = 10;
    ctx.shadowColor = 'rgba(138, 43, 226, 1)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(centerX - w * 0.35, h);
    ctx.bezierCurveTo(centerX - w * 0.4, h * 0.4, centerX, -h * 0.1, centerX + w * 0.1, h * 0.1);
    ctx.lineTo(centerX - w*0.05, h*0.25)
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - w * 0.35, h);
    ctx.lineTo(centerX + w * 0.4, h);
    ctx.stroke();

    for (let i = 0; i < stringCount; i++) {
        const stringId = `harp-${i}`;
        const isActive = !!activeNotes[stringId];
        const xStart = (w * 0.75 / (stringCount - 1)) * i + (centerX - w * 0.35);
        const xEnd = centerX + w * 0.02 * i - w * 0.05;
        const yEnd = h * 0.2;

        ctx.strokeStyle = isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(138, 43, 226, 0.8)';
        ctx.lineWidth = isActive ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(xStart, h);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
};


interface NoteInfo {
    id: string | null;
    note: string | null;
}

const getNoteFromPosition = (x: number, y: number, instrument: InstrumentType, canvasWidth: number, canvasHeight: number): NoteInfo => {
    switch (instrument) {
        case 'piano': {
            const whiteKeys = CHROMATIC_SCALE.filter(k => k.type === 'white');
            const whiteKeyWidth = canvasWidth / whiteKeys.length;
            const blackKeyWidth = whiteKeyWidth * 0.6;
            const blackKeyHeight = canvasHeight * 0.6;
            
            // Check for black key press first
            if (y < blackKeyHeight) {
                let whiteKeyIdx = 0;
                for (let i = 0; i < CHROMATIC_SCALE.length; i++) {
                    const key = CHROMATIC_SCALE[i];
                    if (key.type === 'white') {
                        whiteKeyIdx++;
                    } else {
                        const keyX = whiteKeyIdx * whiteKeyWidth - blackKeyWidth / 2;
                        if (x >= keyX && x <= keyX + blackKeyWidth) {
                            return { id: `key-${i}`, note: key.note };
                        }
                    }
                }
            }
            
            // Check for white key press
            const whiteKeyIndex = Math.floor(x / whiteKeyWidth);
            const keyIndex = CHROMATIC_SCALE.findIndex((key, i) => {
                 const whiteKeyCount = CHROMATIC_SCALE.slice(0, i + 1).filter(k => k.type === 'white').length;
                 return key.type === 'white' && whiteKeyCount - 1 === whiteKeyIndex;
            });

            if (keyIndex !== -1) {
                return { id: `key-${keyIndex}`, note: CHROMATIC_SCALE[keyIndex].note };
            }
            return { id: null, note: null };
        }
        case 'violin': {
            const stringCount = 4;
            for (let i = 0; i < stringCount; i++) {
                const stringX = (canvasWidth / (stringCount + 1)) * (i + 1);
                if (Math.abs(x - stringX) < 25) {
                    const noteIndex = Math.floor((1 - (y / canvasHeight)) * 8) + (i * 2);
                    return { id: `string-${i}`, note: DIATONIC_SCALE[noteIndex % DIATONIC_SCALE.length] };
                }
            }
            return { id: null, note: null };
        }
        case 'harp': {
            const stringCount = DIATONIC_SCALE.length;
            const w = canvasWidth;
            const centerX = w / 2;
            const startX = centerX - w * 0.35;
            const totalWidth = w * 0.75;

            // Simple check based on x-coordinate
            const index = Math.round(((x - startX) / totalWidth) * (stringCount - 1));
            
            if (index >= 0 && index < stringCount) {
                return { id: `harp-${index}`, note: DIATONIC_SCALE[index] };
            }
            return { id: null, note: null };
        }
    }
};

const getPositionForNote = (id: string, canvasWidth: number, canvasHeight: number, lastY: number): { x: number; y: number } | null => {
    const [type, indexStr] = id.split('-');
    const index = parseInt(indexStr, 10);
    const w = canvasWidth;
    const h = canvasHeight;

    switch (type) {
        case 'key': {
            const whiteKeys = CHROMATIC_SCALE.filter(k => k.type === 'white');
            const whiteKeyWidth = w / whiteKeys.length;
            const blackKeyWidth = whiteKeyWidth * 0.6;
            const blackKeyHeight = h * 0.6;
            
            const key = CHROMATIC_SCALE[index];
            if (key.type === 'white') {
                const whiteKeyIndex = CHROMATIC_SCALE.slice(0, index + 1).filter(k => k.type === 'white').length - 1;
                return { x: whiteKeyIndex * whiteKeyWidth + whiteKeyWidth / 2, y: h * 0.8 };
            } else {
                 const whiteKeyIndex = CHROMATIC_SCALE.slice(0, index).filter(k => k.type === 'white').length;
                 return { x: whiteKeyIndex * whiteKeyWidth, y: blackKeyHeight * 0.8 };
            }
        }
        case 'string': {
            const spacing = w / 5;
            return { x: spacing * (index + 1), y: Math.min(h - 20, Math.max(20, lastY)) };
        }
        case 'harp': {
            const centerX = w / 2;
            const startX = centerX - w * 0.35;
            const totalWidth = w * 0.75;
            const x = (totalWidth / (DIATONIC_SCALE.length - 1)) * index + startX;
            return { x: x, y: h * 0.7 };
        }
    }
    return null;
};

const MusicCanvas: React.FC<MusicCanvasProps> = ({ instrument, containerRef }) => {
    const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
    const particleCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);

    const isPlaying = useRef(false);
    const lastPlayedNote = useRef<{ [pointerId: number]: string }>({});
    const lastY = useRef(0);
    
    const createVisualEffects = useParticles(particleCanvasRef);

    useEffect(() => {
        const interactionCanvas = interactionCanvasRef.current;
        const particleCanvas = particleCanvasRef.current;
        const container = containerRef.current;

        if (!container || !interactionCanvas || !particleCanvas) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                interactionCanvas.width = width;
                interactionCanvas.height = height;
                particleCanvas.width = width;
                particleCanvas.height = height;
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, [containerRef]);

    useEffect(() => {
        const draw = () => {
            const ctx = interactionCanvasRef.current?.getContext('2d');
            if (!ctx) return;

            const activeNotes = AudioService.getActiveNotes();
            switch (instrument) {
                case 'piano': drawPiano(ctx, activeNotes); break;
                case 'violin': drawViolin(ctx, activeNotes); break;
                case 'harp': drawHarp(ctx, activeNotes); break;
            }
            animationFrameId.current = requestAnimationFrame(draw);
        };
        
        animationFrameId.current = requestAnimationFrame(draw);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            AudioService.releaseAllNotes();
        };
    }, [instrument]);

    const getEventPosition = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleInteractionStart = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        isPlaying.current = true;
        const pos = getEventPosition(e);
        const { id, note } = getNoteFromPosition(pos.x, pos.y, instrument, e.currentTarget.width, e.currentTarget.height);
        
        if (id && note) {
            AudioService.playNote(note, id);
            lastPlayedNote.current[e.pointerId] = id;
            lastY.current = pos.y;
            const effectPos = getPositionForNote(id, e.currentTarget.width, e.currentTarget.height, pos.y);
            if(effectPos) createVisualEffects(effectPos.x, effectPos.y);
        }
    }, [instrument, createVisualEffects]);

    const handleInteractionMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isPlaying.current) return;
        const pos = getEventPosition(e);
        const { id, note } = getNoteFromPosition(pos.x, pos.y, instrument, e.currentTarget.width, e.currentTarget.height);
        const currentNoteId = lastPlayedNote.current[e.pointerId];
        
        if (id && note && id !== currentNoteId) {
            if(currentNoteId) AudioService.releaseNote(currentNoteId);
            AudioService.playNote(note, id);
            lastPlayedNote.current[e.pointerId] = id;
            const effectPos = getPositionForNote(id, e.currentTarget.width, e.currentTarget.height, pos.y);
            if(effectPos) createVisualEffects(effectPos.x, effectPos.y);
        }
        lastY.current = pos.y;
    }, [instrument, createVisualEffects]);

    const handleInteractionEnd = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        isPlaying.current = false;
        const noteId = lastPlayedNote.current[e.pointerId];
        if (noteId) {
            AudioService.releaseNote(noteId);
            delete lastPlayedNote.current[e.pointerId];
        }
    }, []);

    return (
        <>
            <canvas ref={particleCanvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }} />
            <canvas
                ref={interactionCanvasRef}
                style={{ position: 'absolute', top: 0, left: 0, cursor: 'pointer', zIndex: 1 }}
                onPointerDown={handleInteractionStart}
                onPointerMove={handleInteractionMove}
                onPointerUp={handleInteractionEnd}
                onPointerCancel={handleInteractionEnd}
                onPointerLeave={handleInteractionEnd}
            />
        </>
    );
};

export default MusicCanvas;
