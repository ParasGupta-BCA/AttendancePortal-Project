"use client";

import { ChangePasswordForm } from "@/components/change-password-form";
import { ChangeEmailForm } from "@/components/change-email-form";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, BookOpen, Shield, Laptop, Smartphone, Globe, ChevronDown, ChevronUp, Fingerprint, Plus, Trash2, ShieldCheck, Key } from "lucide-react";
import { startRegistration } from '@simplewebauthn/browser';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function StudentSettingsPage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<{ name: string; email: string; course: string; section: string; role?: string } | null>(null);
    const [loginHistory, setLoginHistory] = useState<{ id: string; device_info: string; ip_address: string; login_at: string }[]>([]);
    const [authenticators, setAuthenticators] = useState<{ id: string; device_type: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [passkeyLoading, setPasskeyLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [showAllPasskeys, setShowAllPasskeys] = useState(false);

    // Helper to parse UA string
    const parseUserAgent = (ua: string) => {
        if (!ua) return "Unknown Device";
        if (ua.includes("Windows")) return "Windows PC";
        if (ua.includes("Mac OS")) return "MacBook / iMac";
        if (ua.includes("Android")) return "Android Phone";
        if (ua.includes("iPhone")) return "iPhone";
        if (ua.includes("iPad")) return "iPad";
        if (ua.includes("Linux")) return "Linux System";
        return "Web Browser";
    };

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

            // Fetch Login History
            const historyRes = await fetch("/api/student/security/login-history");
            const historyData = await historyRes.json();
            if (historyRes.ok && historyData.history) {
                setLoginHistory(historyData.history);
            }

        } catch (error) {
            console.error("Failed to fetch profile info", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthenticators = async () => {
        try {
            const res = await fetch("/api/auth/webauthn/authenticators");
            if (res.ok) {
                const data = await res.json();
                setAuthenticators(data);
            }
        } catch (error) {
            console.error("Failed to fetch authenticators", error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchAuthenticators();

        // Real-time updates: Poll every 5 seconds
        const interval = setInterval(() => {
            fetchProfile();
            fetchAuthenticators();
        }, 5000);
        return () => clearInterval(interval);
    }, [session]);

    const handleRegisterPasskey = async () => {
        setPasskeyLoading(true);
        try {
            // 1. Get options from server
            const resp = await fetch('/api/auth/webauthn/register/challenge');
            const options = await resp.json();

            if (resp.status !== 200) throw new Error(options.error);

            // 2. Browser ceremony
            const attResp = await startRegistration(options);

            // 3. Send validation to server
            const verifyResp = await fetch('/api/auth/webauthn/register/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attResp),
            });

            const verifyJson = await verifyResp.json();

            if (verifyJson.verified) {
                alert('Success! Your device is now registered.');
                fetchAuthenticators(); // Refresh list
            } else {
                throw new Error('Verification failed');
            }
        } catch (error: any) {
            console.error(error);
            alert(`Failed to register device: ${error.message || error}`);
        } finally {
            setPasskeyLoading(false);
        }
    };

    const handleDeleteAuthenticator = async (id: string) => {
        if (!confirm("Are you sure you want to remove this passkey?")) return;

        try {
            const res = await fetch(`/api/auth/webauthn/authenticators?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchAuthenticators();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to remove passkey");
            }
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Error removing passkey");
        }
    };


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
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid gap-6 md:grid-cols-2">
                            <ChangePasswordForm />
                            <ChangeEmailForm />
                        </div>

                        {/* Biometric Security Card */}
                        <Card className="border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
                            <CardHeader className="pb-0 pt-4 px-4">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                            <Fingerprint className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100 block">Biometric Security</span>
                                            <span className="text-xs font-normal text-muted-foreground">
                                                Login with FaceID or TouchID
                                            </span>
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4 sm:p-6 space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Go passwordless! Sign in using your face, fingerprint, or security key.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleRegisterPasskey}
                                            disabled={passkeyLoading}
                                            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {passkeyLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                            Add New Device
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {authenticators.length > 0 ? (
                                            (showAllPasskeys ? authenticators : authenticators.slice(0, 2)).map((auth, idx) => (
                                                <div key={idx} className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "p-2.5 rounded-full shrink-0",
                                                            auth.device_type.includes('Synced')
                                                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                                        )}>
                                                            {auth.device_type.includes('Synced') ? <ShieldCheck className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    Passkey {idx + 1}
                                                                </h4>
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20">
                                                                    Active
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {auth.device_type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteAuthenticator(auth.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Remove Passkey"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                    <Fingerprint className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No passkeys registered</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add your device to sign in faster</p>
                                            </div>
                                        )}

                                        {/* Show More Button for Passkeys */}
                                        {authenticators.length > 2 && (
                                            <button
                                                onClick={() => setShowAllPasskeys(!showAllPasskeys)}
                                                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                                            >
                                                <span>{showAllPasskeys ? "Show Less" : `View ${authenticators.length - 2} More Passkeys`}</span>
                                                {showAllPasskeys ? (
                                                    <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                                                ) : (
                                                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
                            <CardHeader className="pb-0 pt-4 px-4">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100 block">Login Activity</span>
                                            <span className="text-xs font-normal text-muted-foreground">
                                                Where you're logged in
                                            </span>
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="flex flex-col gap-2 p-3">
                                    {loginHistory.length > 0 ? (
                                        (showAllHistory ? loginHistory : loginHistory.slice(0, 3)).map((log, index) => {
                                            const isMobile = log.device_info.toLowerCase().includes('mobile') || log.device_info.toLowerCase().includes('android') || log.device_info.toLowerCase().includes('iphone');
                                            const Icon = isMobile ? Smartphone : Laptop;
                                            const cleanDeviceName = parseUserAgent(log.device_info);
                                            const isCurrent = index === 0; // Assume first is current for now

                                            return (
                                                <div key={log.id} className="group flex items-start gap-3 p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                                                    {/* Icon Box */}
                                                    <div className={cn(
                                                        "p-2.5 rounded-xl shrink-0 transition-colors mt-0.5",
                                                        isMobile ? "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400"
                                                            : "bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400"
                                                    )}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                                {cleanDeviceName}
                                                            </p>
                                                            {isCurrent && (
                                                                <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <Globe className="w-3 h-3 shrink-0 opacity-70" />
                                                                <span className="font-mono">{log.ip_address}</span>
                                                            </div>
                                                            <span className="hidden sm:inline w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                            <span className="font-medium opacity-90">
                                                                {new Date(log.login_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                <span className="mx-1 opacity-50">at</span>
                                                                {new Date(log.login_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-3">
                                                <Shield className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No activity recorded</p>
                                        </div>
                                    )}

                                    {/* Show More Button */}
                                    {loginHistory.length > 3 && (
                                        <button
                                            onClick={() => setShowAllHistory(!showAllHistory)}
                                            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                                        >
                                            <span>{showAllHistory ? "Show Less" : `View ${loginHistory.length - 3} More items`}</span>
                                            {showAllHistory ? (
                                                <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                                            ) : (
                                                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
