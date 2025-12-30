"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export function ChangePasswordForm() {
    const [formData, setFormData] = useState({ currentPassword: "", newPassword: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const json = await res.json();

            if (res.ok) {
                alert("Password changed successfully! Please login again.");
                await signOut({ callbackUrl: "/login" });
            } else {
                alert("Error: " + json.error);
            }
        } catch (e) {
            alert("Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your login credentials securely.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current">Current Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="current"
                                type="password"
                                placeholder="******"
                                className="pl-9"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="new"
                                type="password"
                                placeholder="******"
                                className="pl-9"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full mt-4">
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
