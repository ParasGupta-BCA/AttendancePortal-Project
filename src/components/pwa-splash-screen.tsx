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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-5">
        <div className="relative h-32 w-32 mb-6 animate-pulse">
          <Image
            src="/logo.svg"
            alt="App Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-sans">
          Attendance Portal
        </h1>
        <div className="mt-8 flex space-x-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
