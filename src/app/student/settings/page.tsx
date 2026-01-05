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
                    <Card className="overflow-hidden border shadow-sm dark:bg-gray-800 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="bg-blue-600/10 dark:bg-blue-900/20 border-b dark:border-gray-700 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {profile?.name || session?.user?.name || "Student"}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">Student Profile</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-200">{profile?.email || session?.user?.email || "Loading..."}</p>
                                </div>
                            </div>

                            {/* Course & Section */}
                            <div className="flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Batch Info</p>
                                    {loading ? (
                                        <Skeleton className="h-5 w-32 mt-1" />
                                    ) : (
                                        <p className="font-semibold text-gray-900 dark:text-gray-200">
                                            {profile ? `${profile.course} (${profile.section})` : "Not Available"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Role */}
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-200 capitalize">{(session?.user as any)?.role || "Student"}</p>
                                </div>
                            </div>
                        </CardContent>
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
