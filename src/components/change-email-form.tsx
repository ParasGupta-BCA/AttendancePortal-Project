"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChangeEmailForm() {
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/change-email", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail, currentPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Email updated successfully! Please login with your new email.");
                // Optionally sign out the user
                // signOut();
                router.refresh(); // Or redirect
            } else {
                alert(data.error || "Failed to update email");
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Change Email Address</CardTitle>
                <CardDescription>Update your registered email address.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-email">New Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="new-email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-9"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current-pass-email">Current Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="current-pass-email"
                                type="password"
                                placeholder="******"
                                className="pl-9"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Email"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
