"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export function PWASplashScreen() {
    const [show, setShow] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if running in standalone mode (PWA)
        const isPWA =
            window.matchMedia("(display-mode: standalone)").matches ||
            // For iOS Safari
            (window.navigator as any).standalone === true;

        // Uncomment true for development testing
        if (isPWA /* || true */) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
            }, 2500); // Show for 2.5 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    if (!mounted || !show) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-all duration-1000 ease-in-out ${show ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none scale-110"
                }`}
        >
            <div className="relative h-56 w-56 md:h-72 md:w-72 animate-breathe">
                {/* Shockwave Effect Behind Logo */}
                <div className="absolute inset-0 -z-10 rounded-3xl animate-shockwave bg-blue-500/20 blur-xl opacity-0" />

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="relative w-full h-full drop-shadow-2xl overflow-hidden rounded-[20%]">
                    <defs>
                        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: "#2563eb", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "#0070f3", stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <rect width="512" height="512" rx="100" fill="url(#g1)" />
                    {/* Shield/Checkmark Combo */}
                    <path
                        d="M256 64c-60 0-110 20-130 50v140c0 90 50 170 130 210c80-40 130-120 130-210V114c-20-30-70-50-130-50z"
                        fill="white"
                        opacity="0.2"
                    />
                    <path
                        d="M256 84c-50 0-100 20-110 40v130c0 80 40 150 110 190c70-40 110-110 110-190V124c-10-20-60-40-110-40z"
                        fill="white"
                    />
                    {/* Checkmark with Draw Animation */}
                    <path
                        d="M180 250l60 60 110 -110"
                        stroke="#0070f3"
                        strokeWidth="40"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-check"
                    />
                </svg>

                {/* Glass Shine Effect Overlay */}
                <div className="absolute inset-0 z-20 overflow-hidden rounded-[20%] pointer-events-none">
                    <div className="absolute top-0 w-1/2 h-full bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-25 animate-shine" />
                </div>
            </div>
        </div>
    );
}
