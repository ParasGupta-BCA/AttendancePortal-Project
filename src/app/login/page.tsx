"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Attendance Portal</CardTitle>
                    <CardDescription>Login to access the dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-gray-100 dark:bg-gray-900 px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                            onClick={handlePasskeyLogin}
                            disabled={loading || !email}
                        >
                            <Fingerprint className="w-4 h-4" />
                            Login with FaceID / TouchID
                        </Button>
                    </form>
                </CardContent>
                <div className="p-6 pt-0 flex justify-center">
                    <p className="text-sm text-gray-500">
                        New Student? <a href="/signup" className="text-indigo-600 hover:underline">Register Here</a>
                    </p>
                </div>
            </Card>
        </div>
    );
}
