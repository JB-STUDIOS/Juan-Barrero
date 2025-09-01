import { useRef, useEffect, useCallback } from 'react';

class FlameParticle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    color: string;
    life: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 20 + 10;
        this.speedY = Math.random() * -1.5 - 0.5;
        this.color = `hsl(${Math.random() * 50 + 280}, 100%, 50%)`;
        this.life = 1;
    }

    update() {
        this.y += this.speedY;
        this.life -= 0.02;
        // The previous logic `if (this.size > 0.2) this.size -= 0.5;` could result in a negative size.
        // For example, if size was 0.3, it would become -0.2, causing the `arc` function to fail.
        // Using Math.max ensures the size never drops below 0.
        this.size = Math.max(0, this.size - 0.5);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }
}

export const useParticles = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const particles = useRef<FlameParticle[]>([]);
    // FIX: Changed useRef<number>() to useRef<number | null>(null) to fix "Expected 1 arguments, but got 0" error.
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        // FIX: The canvas and context are now retrieved inside the animation loop.
        // This prevents a stale closure where they could be permanently null if the canvas wasn't ready on initial render,
        // which would cause a busy-wait loop. This makes the animation robust.
        const animate = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let i = particles.current.length - 1; i >= 0; i--) {
                    const p = particles.current[i];
                    p.update();
                    p.draw(ctx);
                    if (p.life <= 0) {
                        particles.current.splice(i, 1);
                    }
                }
            }
            if(animationFrameId.current) {
                animationFrameId.current = requestAnimationFrame(animate);
            }
        };

        // FIX: The animation loop is started with requestAnimationFrame to ensure the callback signature is consistent.
        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [canvasRef]);

    const createParticles = useCallback((x: number, y: number) => {
        const count = 15;
        for (let i = 0; i < count; i++) {
            particles.current.push(new FlameParticle(x, y));
        }
    }, []);

    return createParticles;
};