"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, QrCode, History, Settings, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { MobileGuard } from "@/components/mobile-guard";
import { GreetingHeader } from "@/components/student/greeting-header";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Function to apply theme
        const applyTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
                setIsDark(true);
                document.documentElement.classList.add('dark');
            } else {
                setIsDark(false);
                document.documentElement.classList.remove('dark');
            }
        };

        // Apply on mount
        applyTheme();

        // Listen for system changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            // Only adapt to system if no manual override is set
            if (!localStorage.getItem('theme')) {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <MobileGuard>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-300">
                <header className="bg-white dark:bg-gray-800 shadow px-4 py-3 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">
                    <GreetingHeader />
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </header>
                <main className="flex-1 p-4">
                    {children}
                </main>
                <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t z-50 safe-area-bottom h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-around items-end h-full pb-2">
                        <Link href="/student/dashboard" className="flex flex-col items-center gap-1 w-16 text-gray-500 hover:text-blue-500 transition-colors">
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-[10px] font-medium">Home</span>
                        </Link>

                        <Link href="/student/history" className="flex flex-col items-center gap-1 w-16 text-gray-500 hover:text-blue-500 transition-colors">
                            <History className="w-5 h-5" />
                            <span className="text-[10px] font-medium">History</span>
                        </Link>

                        {/* Floating Scan Button */}
                        <div className="relative w-16 flex justify-center z-10">
                            <Link href="/student/scan" className="flex flex-col items-center group w-full">
                                <div className="absolute bottom-6 bg-blue-600 rounded-full p-3.5 shadow-xl border-[4px] border-gray-50 dark:border-gray-900 transform transition-all duration-300 group-hover:scale-110 group-active:scale-95 shadow-blue-500/25">
                                    <QrCode className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-[10px] font-medium text-gray-500 group-hover:text-blue-500 transition-colors">Scan</span>
                            </Link>
                        </div>

                        <Link href="/student/settings" className="flex flex-col items-center gap-1 w-16 text-gray-500 hover:text-blue-500 transition-colors">
                            <Settings className="w-5 h-5" />
                            <span className="text-[10px] font-medium">Settings</span>
                        </Link>

                        <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex flex-col items-center gap-1 w-16 text-red-500 hover:text-red-700 transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span className="text-[10px] font-medium">Logout</span>
                        </button>
                    </div>
                </nav>
            </div>
        </MobileGuard>
    );
}
