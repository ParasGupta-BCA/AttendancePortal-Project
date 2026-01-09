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
            <div className="relative h-48 w-48 md:h-64 md:w-64 animate-breathe">
                <Image
                    src="/logo.svg"
                    alt="App Logo"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                />
            </div>
        </div>
    );
}
