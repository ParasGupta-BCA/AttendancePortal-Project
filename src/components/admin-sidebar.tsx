"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BookOpen, Calendar, Settings, LogOut, UserPlus } from "lucide-react";
import { signOut } from "next-auth/react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Timetable & Attendance",
        icon: Calendar,
        href: "/admin/timetable",
        color: "text-violet-500",
    },
    {
        label: "Student Requests",
        icon: UserPlus,
        href: "/admin/requests",
        color: "text-amber-500",
    },
    {
        label: "Students",
        icon: Users,
        href: "/admin/students",
        color: "text-pink-700",
    },
    {
        label: "Faculty",
        icon: Users,
        href: "/admin/faculty",
        color: "text-orange-700",
    },
    {
        label: "Subjects",
        icon: BookOpen,
        href: "/admin/subjects",
        color: "text-emerald-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/admin/settings",
    },
];

interface SidebarProps {
    onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/admin/dashboard" className="flex items-center pl-3 mb-14" onClick={onNavigate}>
                    <h1 className="text-2xl font-bold">Admin Portal</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={onNavigate}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                // Active state logic can be added here if this was a client component with usePathname
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
