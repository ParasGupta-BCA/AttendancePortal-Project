"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500" />
                </div>
                <h2 className="text-xl font-semibold">Invalid Link</h2>
                <p className="text-zinc-500">This password reset link is invalid or missing.</p>
                <Button asChild variant="outline">
                    <Link href="/login">Return to Login</Link>
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to reset password");

            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000); // Redirect after 3s
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold text-xl">Password Reset Successful!</h3>
                    <p className="text-zinc-500">
                        You can now log in with your new password. <br />
                        Redirecting you to login...
                    </p>
                </div>
                <Button asChild className="mt-4 w-full">
                    <Link href="/login">Go to Login Now</Link>
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-zinc-300 dark:border-zinc-700"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-zinc-300 dark:border-zinc-700"
                />
            </div>
            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
            <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {loading ? "Resetting..." : "Set New Password"}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-sm shadow-xl border-zinc-200 dark:border-zinc-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Create a strong password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
