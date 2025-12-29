"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SetupPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/setup-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: password })
            });

            if (res.ok) {
                // Must force reload/re-fetch session to clear the flag in the session object
                // But simplest is to push to login or dashboard. 
                // Since session strategy is JWT, the token has the OLD flag.
                // We need to re-login to refresh the token.
                alert("Password set successfully! Please login again.");
                // Redirect to logout to force token refresh? Or just dashboard and let next session refresh handle it?
                // NextAuth JWTs don't auto-update. Best to signOut/signIn.
                window.location.href = "/api/auth/signout?callbackUrl=/login";
            } else {
                const json = await res.json();
                alert("Error: " + json.error);
                setLoading(false);
            }
        } catch (e) {
            alert("Failed to set password");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome! Setup Password</CardTitle>
                    <CardDescription>Since this is your first login, please set a secure password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm Password</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Setting Password..." : "Set Password & Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
