"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { generateToken } from "@/utils/dynamicQrClient";
import { cn } from "@/lib/utils";

interface DynamicQRDisplayProps {
    code: string;
    interval?: number;
    className?: string; // Add className prop type
}

export function DynamicQRDisplay({ code, interval = 5, className }: DynamicQRDisplayProps) {
    const [src, setSrc] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [progress, setProgress] = useState<number>(100);

    // We update this whenever time ticks past the interval boundary
    const [currentStep, setCurrentStep] = useState<number>(Math.floor(Date.now() / 1000 / interval));

    // Effect for the "Tick" (Timer)
    useEffect(() => {
        const tick = () => {
            const now = Date.now();
            const step = Math.floor(now / 1000 / interval);

            // Time remaining for *current* step
            const nextTime = (step + 1) * interval * 1000;
            const remainingMs = Math.max(0, nextTime - now);

            const seconds = Math.ceil(remainingMs / 1000);
            const prog = (remainingMs / (interval * 1000)) * 100;

            setTimeLeft(seconds);
            setProgress(prog);

            if (step !== currentStep) {
                setCurrentStep(step);
            }
        };

        // Run immediately
        tick();

        const timer = setInterval(tick, 100); // 10Hz update for smoother progress bar
        return () => clearInterval(timer);
    }, [interval, currentStep]);

    // Effect for Generating QR (Runs when 'currentStep' changes)
    useEffect(() => {
        let isMounted = true;
        const generate = async () => {
            try {
                // Generate token based on current time step
                // (Though generateToken internally uses Date.now too, ideally we pass step?)
                // The implementation of generateToken uses Date.now() / interval. So calling it *now* is correct.
                const token = await generateToken(code, interval);
                const fullCode = `${code}:${token}`;

                // Use higher resolution/config if needed
                const url = await QRCode.toDataURL(fullCode, { width: 300, margin: 2 });

                if (isMounted) setSrc(url);
            } catch (e) {
                console.error("QR Gen Error", e);
            }
        };
        generate();
        return () => { isMounted = false; };
    }, [code, interval, currentStep]); // Depend on currentStep to re-trigger

    return (
        <div className={cn("flex flex-col items-center space-y-4 w-full max-w-xs p-4 bg-white/5 rounded-xl border border-white/10", className)}>
            {src ? (
                <div className="relative group overflow-hidden rounded-xl shadow-2xl transition-all duration-300 hover:shadow-primary/20">
                    <img
                        src={src}
                        alt="Dynamic Attendance QR"
                        className="w-64 h-64 border-4 border-white object-contain bg-white"
                    />

                    {/* Floating pill showing interval */}
                    <div className="absolute top-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md shadow-sm border border-white/20">
                        {interval}s Safety
                    </div>
                </div>
            ) : (
                <div className="w-64 h-64 border-4 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50 animate-pulse">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <span className="text-xs text-muted-foreground font-medium">Generating Secure QR...</span>
                </div>
            )}

            <div className="w-full space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground tracking-wide">
                    <div className="flex items-center gap-1.5">
                        <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="uppercase">Auto-Refreshing</span>
                    </div>
                    <span className={cn("font-mono text-sm tabular-nums transition-colors duration-300",
                        timeLeft <= 3 ? "text-red-500 font-bold scale-110" : "text-foreground"
                    )}>
                        {timeLeft}s
                    </span>
                </div>

                {/* Custom Progress Bar */}
                <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-300 rounded-full bg-primary",
                            timeLeft <= 3 && "bg-red-500"
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <p className="text-[10px] text-center text-muted-foreground/60 max-w-[200px] leading-tight">
                Scan within the countdown window. Code expires instantly when timer resets.
            </p>
        </div>
    );

// Simple internal Progress component wrapper if needed, but assuming shadcn/ui progress exists?
// Based on file list, user has consistent usage of @/components/ui/progress.
// If it doesn't exist, I'll need to create it or allow it to fail.
