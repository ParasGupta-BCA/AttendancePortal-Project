"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut, Calendar, Settings, UserCheck } from "lucide-react";
import { signOut } from "next-auth/react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/faculty/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Timetable & Attendance",
        icon: Calendar,
        href: "/faculty/timetable",
        color: "text-violet-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/faculty/settings",
        color: "text-gray-500",
    },
    {
        label: "Manual Attendance",
        icon: UserCheck,
        href: "/faculty/manual-attendance",
        color: "text-orange-500",
    },
];

interface FacultySidebarProps {
    onNavigate?: () => void;
}

export function FacultySidebar({ onNavigate }: FacultySidebarProps) {
    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/faculty/dashboard" className="flex items-center pl-3 mb-14" onClick={onNavigate}>
                    <h1 className="text-2xl font-bold">Faculty Portal</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={onNavigate}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-red-500"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </div>
            </div>
        </div>
    );
}
