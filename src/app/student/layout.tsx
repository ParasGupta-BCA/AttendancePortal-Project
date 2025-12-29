"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, QrCode, History, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
            <header className="bg-white dark:bg-gray-800 shadow px-4 py-3 flex justify-between items-center sticky top-0 z-50">
                <h1 className="font-bold text-lg">Student Portal</h1>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-500">
                    <LogOut className="w-5 h-5" />
                </button>
            </header>
            <main className="flex-1 p-4">
                {children}
            </main>
            <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t z-50 safe-area-bottom h-16">
                <div className="relative flex justify-between items-center h-full px-6">
                    {/* Left Side */}
                    <div className="flex gap-8">
                        <Link href="/student/dashboard" className="flex flex-col items-center text-xs text-gray-500 hover:text-blue-500">
                            <LayoutDashboard className="w-5 h-5 mb-1" />
                            Home
                        </Link>
                    </div>

                    {/* Center Floating Button */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                        <Link href="/student/scan" className="flex flex-col items-center">
                            <div className="bg-blue-600 rounded-full p-4 shadow-lg border-4 border-gray-50 dark:border-gray-900 transform transition-transform hover:scale-105">
                                <QrCode className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-xs text-gray-500 mt-1 font-medium">Scan</span>
                        </Link>
                    </div>

                    {/* Right Side */}
                    <div className="flex gap-8">
                        <Link href="/student/history" className="flex flex-col items-center text-xs text-gray-500 hover:text-blue-500">
                            <History className="w-5 h-5 mb-1" />
                            History
                        </Link>
                        <Link href="/student/settings" className="flex flex-col items-center text-xs text-gray-500 hover:text-blue-500">
                            <Settings className="w-5 h-5 mb-1" />
                            Settings
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    );
}
