"use client";

import { useEffect, useState } from "react";
import { Smartphone, Copy, Check, LogOut, Download, Share, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function MobileGuard({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [isIOS, setIsIOS] = useState<boolean>(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const mobileUA = /android|ipad|iphone|ipod/i.test(userAgent);
            const smallScreen = window.innerWidth < 1024; // Expanded to include iPad mini/Air in portrait
            const ios = /ipad|iphone|ipod/i.test(userAgent);

            setIsMobile(smallScreen || mobileUA);
            setIsIOS(ios);

            // Check if PWA is installed/running in standalone mode
            const isStandaloneMode =
                window.matchMedia('(display-mode: standalone)').matches || // Standard
                (window.navigator as any).standalone === true || // iOS Safari legacy
                document.referrer.includes('android-app://'); // Android trusted web activity

            setIsStandalone(isStandaloneMode);
        };

        checkDevice();
        window.addEventListener("resize", checkDevice);

        // Listen for PWA installation
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleModeChange = (e: MediaQueryListEvent) => {
            setIsStandalone(e.matches);
        };

        // Safety check for modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleModeChange);
        }

        return () => {
            window.removeEventListener("resize", checkDevice);
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleModeChange);
            }
        };
    }, []);

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isMobile === null) return null;

    // Desktop Users -> Existing "Mobile Only" Screen
    if (!isMobile) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-gray-900 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>

                <div className="relative backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center hover:scale-[1.02] transition-transform duration-500">
                    <div className="mb-6 relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative bg-gradient-to-tr from-blue-600 to-purple-600 p-5 rounded-2xl shadow-lg">
                            <Smartphone className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                        Mobile Experience Only
                    </h1>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        The Student Portal is exclusively designed for mobile devices.
                    </p>

                    <Button onClick={handleCopyLink} variant="outline" className="w-full h-12 border-white/20 hover:bg-white/10 hover:text-white text-gray-300 bg-transparent backdrop-blur-sm transition-all group">
                        {copied ? <><Check className="w-4 h-4 mr-2 text-green-400" /><span className="text-green-400">Link Copied!</span></> : <><Copy className="w-4 h-4 mr-2 group-hover:text-blue-400 transition-colors" /><span>Copy Link to Clipboard</span></>}
                    </Button>
                </div>
            </div>
        );
    }

    // Mobile Users BUT NOT Installed (Browser Mode) -> New "Install App" Screen
    if (isMobile && !isStandalone) {
        // Automatic Redirect Logic
        // We try to simply reload the page once, which can trigger the "Open with App" intent on Android
        if (typeof window !== "undefined" && !sessionStorage.getItem("pwa_redirect_attempted")) {
            sessionStorage.setItem("pwa_redirect_attempted", "true");
            window.location.reload();
            return null; // Return null while reloading to prevent flash
        }

        const handleOpenApp = () => {
            // Force a navigation event which triggers the intent picker on many OSs if app is installed
            window.location.reload();
        };

        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-gray-950 text-white">
                 <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
                
                {/* Reverting to simple design but ensuring scrollability for small screens */}
                <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center space-y-6 p-6 overflow-y-auto max-h-full scrollbar-hide">
                    <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-6 rounded-[2rem] shadow-2xl shadow-blue-500/20 mb-4 animate-bounce-slow">
                        <Download className="w-16 h-16 text-white" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight">Install App</h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            To access the Student Portal, you must install the app on your device for the best experience.
                        </p>
                    </div>

                     {/* Open App Button (For users who already have it) */}
                     <Button 
                        onClick={handleOpenApp}
                        variant="secondary"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none"
                    >
                        Already Installed? Open App
                    </Button>

                    {/* Installation Instructions */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mt-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">How to Install</h3>
                        
                        {isIOS ? (
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 p-2 rounded-lg"><Share className="w-6 h-6 text-blue-400" /></div>
                                    <span className="text-gray-300">1. Tap the <span className="font-bold text-white">Share</span> button below</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 p-2 rounded-lg"><Download className="w-6 h-6 text-blue-400" /></div>
                                    <span className="text-gray-300">2. Select <span className="font-bold text-white">Add to Home Screen</span></span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 p-2 rounded-lg"><MoreVertical className="w-6 h-6 text-blue-400" /></div>
                                    <span className="text-gray-300">1. Tap the <span className="font-bold text-white">Menu</span> (3 dots)</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 p-2 rounded-lg"><Download className="w-6 h-6 text-blue-400" /></div>
                                    <span className="text-gray-300">2. Select <span className="font-bold text-white">Install App</span> or <span className="font-bold text-white">Add to Home Screen</span></span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-8 left-0 w-full text-center">
                    <p className="text-gray-600 text-xs">AttendancePortal &bull; PWA Required</p>
                </div>
            </div>
        );
    }

    // PWA Mode -> Allow Access
    return <>{children}</>;
}
