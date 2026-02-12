"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ChangeEmailForm } from "@/components/change-email-form";

export default function SettingsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = () => {
        fetch("/api/admin/users")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.users || []);
                setLoading(false);
            });
    };

    const [qrInterval, setQrInterval] = useState("5");

    useEffect(() => {
        fetchUsers();
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                if (data.qr_refresh_interval) setQrInterval(data.qr_refresh_interval);
            })
            .catch(err => console.error("Failed to fetch settings", err));
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        const res = await fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, newRole })
        });

        if (res.ok) {
            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert("Role updated successfully!");
        } else {
            alert("Failed to update role.");
        }
    };

    const saveSystemSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qr_refresh_interval: qrInterval })
            });
            if (res.ok) alert("Settings saved!");
            else alert("Failed to save settings");
        } catch (e) {
            alert("Error saving settings");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                    <TabsTrigger value="account">My Account</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>Manage user roles and permissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Current Role</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.full_name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'faculty' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    defaultValue={user.role}
                                                    onValueChange={(val) => handleRoleChange(user.id, val)}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue placeholder="Select Role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="faculty">Faculty</SelectItem>
                                                        <SelectItem value="student">Student</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.length === 0 && !loading && <TableRow><TableCell colSpan={4} className="text-center">No users found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dynamic QR Settings</CardTitle>
                            <CardDescription>Configure the security parameters for attendance QR codes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">QR Refresh Interval (seconds)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        min="1"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-[200px]"
                                        value={qrInterval}
                                        onChange={(e) => setQrInterval(e.target.value)}
                                    />
                                    <Button onClick={saveSystemSettings}>Save Changes</Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Lower values are more secure against proxy attendance but require better internet connectivity.
                                    Recommended: 5-10 seconds.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="account">
                    <div className="grid gap-10 md:grid-cols-2 max-w-4xl">
                        <ChangePasswordForm />
                        <ChangeEmailForm />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
