"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

        if (res?.error) {
            alert("Invalid credentials. (Note: Seed data passwords might need hashing update)");
            setLoading(false);
        } else {
            // Fetch session to check role
            try {
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
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
