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
                    <div className="relative w-16 flex justify-center">
                        <Link href="/student/scan" className="flex flex-col items-center group w-full">
                            <div className="absolute -top-12 bg-blue-600 rounded-full p-4 shadow-xl border-[4px] border-gray-50 dark:border-gray-900 transform transition-all duration-300 group-hover:scale-110 group-active:scale-95 group-hover:shadow-blue-500/25">
                                <QrCode className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 group-hover:text-blue-500 transition-colors pt-4">Scan</span>
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
    );
}
