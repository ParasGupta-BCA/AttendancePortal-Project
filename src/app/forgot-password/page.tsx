"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Something went wrong");

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-sm shadow-xl border-zinc-200 dark:border-zinc-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to receive a reset link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Check your email</h3>
                                <p className="text-zinc-500 text-sm">
                                    We sent a password reset link to <span className="font-medium text-zinc-900">{email}</span>.
                                </p>
                            </div>
                            <Button asChild className="w-full mt-4" variant="outline">
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-zinc-300 dark:border-zinc-700"
                                />
                            </div>
                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                            <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!success && (
                    <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-800 pt-4">
                        <Link href="/login" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
