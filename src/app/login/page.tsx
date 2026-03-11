"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { startAuthentication } from '@simplewebauthn/browser';
import { Fingerprint } from "lucide-react";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const user = session.user as any;
            if (user.role === 'student') {
                router.replace("/student/dashboard");
            } else if (user.role === 'faculty') {
                router.replace("/faculty/dashboard");
            } else {
                router.replace("/admin/dashboard");
            }
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Attempt login
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        await handleLoginResponse(res);
    };

    const handlePasskeyLogin = async () => {
        if (!email) {
            alert("Please enter your email address first.");
            return;
        }
        setLoading(true);
        try {
            // 1. Get Challenge
            const resp = await fetch(`/api/auth/webauthn/authenticate/challenge?email=${encodeURIComponent(email)}`);
            const options = await resp.json();
            if (resp.status !== 200) throw new Error(options.error);

            // 2. Browser Ceremony
            const authResp = await startAuthentication(options);

            // 3. Verify
            const verifyResp = await fetch('/api/auth/webauthn/authenticate/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, verificationResponse: authResp }),
            });
            const verifyJson = await verifyResp.json();

            if (verifyJson.verified && verifyJson.token) {
                // 4. Sign In with Token
                const res = await signIn("credentials", {
                    email,
                    password: `PASSKEY-TOKEN:${verifyJson.token}`,
                    redirect: false,
                });
                await handleLoginResponse(res);
            } else {
                throw new Error('Verification failed');
            }
        } catch (error: any) {
            console.error(error);
            if (error.name === 'NotAllowedError') {
                alert("Login cancelled. Please try again.");
            } else {
                alert("Biometric login failed. Please ensure you are on a supported device and have registered your passkey in Settings.");
            }
            setLoading(false);
        }
    };

    const handleLoginResponse = async (res: any) => {
        if (res?.error) {
            alert("Login failed.");
            setLoading(false);
        } else {
            // Fetch session to check role
            try {
                // Short delay to ensure session propagates
                await new Promise(r => setTimeout(r, 500));

                // We can just reload or allow the useEffect to redirect
                // But explicit check is safer
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                if (session?.user?.must_change_password) {
                    router.push("/setup-password");
                } else if (session?.user?.role === 'student') {
                    router.push("/student/dashboard");
                } else if (session?.user?.role === 'faculty') {
                    router.push("/faculty/dashboard");
                } else {
                    router.push("/admin/dashboard");
                }
            } catch (e) {
                console.error("Session fetch error", e);
                router.push("/admin/dashboard"); // Fallback
            }
        }
    };

    if (status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p>Checking session...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-sm sm:max-w-md shadow-2xl border-zinc-200 dark:border-zinc-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight text-zinc-900 dark:text-zinc-50">Attendance Portal</CardTitle>
                    <CardDescription className="text-center text-zinc-500 dark:text-zinc-400">Login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                            />
                        </div>
                        <div className="flex items-center justify-end">
                            <Link href="/forgot-password" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-zinc-500 dark:text-zinc-400">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            onClick={handlePasskeyLogin}
                            disabled={loading || !email}
                        >
                            <Fingerprint className="w-4 h-4" />
                            Login with FaceID / TouchID
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    <div className="flex flex-col items-center space-y-3 w-full">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            New Student? <Link href="/signup" className="text-zinc-900 dark:text-zinc-50 font-medium hover:underline underline-offset-4">Register Here</Link>
                        </p>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full my-1"></div>
                        {/* Modern Tuition Portal Switch */}
                        <Link
                            href="/tuition/login"
                            className="group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 p-2 rounded-lg bg-blue-600 text-white shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Tuition Center?</p>
                                    <p className="text-xs text-blue-500 dark:text-blue-400">Switch to Tuition Portal</p>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </Link>
                    </div>
                </CardFooter>

            </Card>
        </div>
    );
}
