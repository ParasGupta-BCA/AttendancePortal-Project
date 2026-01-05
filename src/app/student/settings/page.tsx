"use client";

import { ChangePasswordForm } from "@/components/change-password-form";
import { ChangeEmailForm } from "@/components/change-email-form";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, BookOpen, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function StudentSettingsPage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<{ name: string; email: string; course: string; section: string; role?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/student/dashboard");
            const data = await res.json();
            if (res.ok && data.studentDetails) {
                setProfile({
                    name: data.studentDetails.name,
                    email: data.studentDetails.email,
                    course: data.studentDetails.course,
                    section: data.studentDetails.section,
                    role: (session?.user as any)?.role || "Student"
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile info", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();

        // Real-time updates: Poll every 5 seconds
        const interval = setInterval(fetchProfile, 5000);
        return () => clearInterval(interval);
    }, [session]);

    if (loading) return (
        <div className="space-y-6 p-4 pt-6 pb-20">
            <Skeleton className="h-8 w-32 mb-4" />

            <div className="max-w-4xl space-y-6">
                {/* Tabs Skeleton */}
                <Skeleton className="h-10 w-full max-w-md mx-auto rounded-full" />

                {/* Profile Card Skeleton */}
                <div className="rounded-xl overflow-hidden border shadow-sm bg-white dark:bg-gray-900">
                    <Skeleton className="h-32 w-full" /> {/* Cover */}
                    <div className="px-6 pb-8">
                        <div className="relative -mt-16 mb-4 flex justify-center">
                            <Skeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900" />
                        </div>
                        <div className="flex flex-col items-center gap-2 mb-8">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-6 w-32 rounded-full" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 pb-20">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Settings</h2>

            <div className="max-w-4xl space-y-6">
                {/* Tab Switcher */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full w-full max-w-md mx-auto mb-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={cn(
                            "flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-200",
                            activeTab === 'profile'
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={cn(
                            "flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-200",
                            activeTab === 'account'
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                    >
                        Account Settings
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-gray-200 dark:ring-gray-800">
                        {/* Modern Gradient Header */}
                        <div className="h-32 relative bg-gray-100 dark:bg-gray-800">
                            <img
                                src="/student-profile-cover.webp"
                                alt="Profile Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10" />
                        </div>

                        <div className="px-6 pb-8">
                            {/* Avatar - Overlapping Header */}
                            <div className="relative -mt-16 mb-4 flex justify-center">
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <User className="w-16 h-16" />
                                </div>
                            </div>

                            {/* User Info - Centered */}
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {profile?.name || session?.user?.name || "Student"}
                                </h3>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span className="capitalize">{(session?.user as any)?.role || "Student"} Profile</span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
                                {/* Email Card */}
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                                Email Address
                                            </p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 break-all">
                                                {profile?.email || session?.user?.email || "Loading..."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Batch Card */}
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                                Academic Batch
                                            </p>
                                            {loading ? (
                                                <Skeleton className="h-5 w-24" />
                                            ) : (
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {profile ? `${profile.course} (${profile.section})` : "Not Available"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'account' && (
                    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ChangePasswordForm />
                        <ChangeEmailForm />
                    </div>
                )}
            </div>
        </div>
    );
}
