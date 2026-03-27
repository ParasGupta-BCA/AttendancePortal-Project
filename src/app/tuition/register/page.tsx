'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TuitionRegister() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const user = session.user as any;
            if (user.is_tuition_user) {
                router.replace("/tuition/dashboard");
            } else {
                // College user tried to access tuition register, redirect to college dashboard
                if (user.role === 'student') router.replace("/student/dashboard");
                else if (user.role === 'faculty') router.replace("/faculty/dashboard");
                else router.replace("/admin/dashboard");
            }
        }
    }, [status, session, router]);

    if (status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <p className="text-sm text-gray-500 animate-pulse">Checking session...</p>
            </div>
        );
    }

    const [form, setForm] = useState({
        institution_name: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        confirm_password: '',
        address: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (form.admin_password !== form.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        const res = await fetch('/api/tuition/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                institution_name: form.institution_name,
                admin_name: form.admin_name,
                admin_email: form.admin_email,
                admin_password: form.admin_password,
                address: form.address,
            }),
        });

        const json = await res.json();
        setIsLoading(false);

        if (!res.ok) {
            setError(json.error || 'Something went wrong');
        } else {
            setSuccess('Institution created! Redirecting to login...');
            setTimeout(() => router.push('/tuition/login'), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-10 px-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold">Create Institution</h1>
                    </div>
                    <p className="text-blue-100 text-sm">Set up your tuition center on the portal</p>
                </div>

                <div className="px-8 py-6 space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Institution Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Institution Name</label>
                            <input
                                name="institution_name"
                                type="text"
                                required
                                value={form.institution_name}
                                onChange={handleChange}
                                placeholder="e.g. Bright Minds Tuition Center"
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Address (optional) */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Address <span className="text-gray-400 font-normal">(optional)</span></label>
                            <input
                                name="address"
                                type="text"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="e.g. 123 Main St, City"
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-zinc-800"/>

                        {/* Admin Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Admin Name</label>
                            <input
                                name="admin_name"
                                type="text"
                                required
                                value={form.admin_name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Admin Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Admin Email</label>
                            <input
                                name="admin_email"
                                type="email"
                                required
                                value={form.admin_email}
                                onChange={handleChange}
                                placeholder="admin@yourinstitution.com"
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Password</label>
                                <input
                                    name="admin_password"
                                    type="password"
                                    required
                                    value={form.admin_password}
                                    onChange={handleChange}
                                    placeholder="Min 6 chars"
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Confirm</label>
                                <input
                                    name="confirm_password"
                                    type="password"
                                    required
                                    value={form.confirm_password}
                                    onChange={handleChange}
                                    placeholder="Repeat password"
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                    Creating Institution...
                                </span>
                            ) : 'Create Institution →'}
                        </button>
                    </form>

                    {/* Back to login */}
                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                        <a
                            href="/tuition/login"
                            className="group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-sm transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 p-1.5 rounded-lg bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">Already registered?</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Back to Login</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
