"use client";

import { useEffect, useState } from "react";
import { Smartphone, Copy, Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function MobileGuard({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobileUA = /android|ipad|iphone|ipod/i.test(userAgent);
            const isSmallScreen = window.innerWidth < 768; // Standard tablet/mobile breakpoint

            // We consider it "mobile" if it's a small screen OR has a mobile UA
            // But to be valid for this portal, we really want the small screen experience.
            setIsMobile(isSmallScreen || isMobileUA);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isMobile === null) {
        return null; // Prevent hydration mismatch or flash
    }

    if (isMobile) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-gray-900 overflow-hidden">
            {/* Ambient Background globs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            {/* Glass Card */}
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
                    The Student Portal is exclusively designed for mobile devices to provide the best scanning and attendance experience.
                </p>

                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                        Switch to your phone
                    </p>

                    <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        className="w-full h-12 border-white/20 hover:bg-white/10 hover:text-white text-gray-300 bg-transparent backdrop-blur-sm transition-all group"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2 text-green-400" />
                                <span className="text-green-400">Link Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2 group-hover:text-blue-400 transition-colors" />
                                <span>Copy Link to Clipboard</span>
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        variant="ghost"
                        className="w-full h-12 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group"
                    >
                        <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        Log Out
                    </Button>
                </div>
            </div>

            <p className="absolute bottom-8 text-gray-500 text-xs">
                Attendance Portal &bull; Secure Mobile Access
            </p>
        </div>
    );
}
