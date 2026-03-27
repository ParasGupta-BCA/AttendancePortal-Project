"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';

export default function SignupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

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

    if (status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <p className="text-zinc-500 animate-pulse">Checking session...</p>
            </div>
        );
    }
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        enrollmentNo: "",
        erpId: "",
        courseYear: "", // Removed default to force selection
        section: ""   // Removed default to force selection
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [courses, setCourses] = useState<{ id: string, name: string }[]>([]);
    const [sections, setSections] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await fetch('/api/meta');
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data.courses || []);
                    setSections(data.sections || []);
                }
            } catch (error) {
                console.error("Failed to fetch metadata", error);
            }
        };
        fetchMeta();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                ...formData,
                enrollmentNo: `0231BCA${formData.enrollmentNo}`,
                erpId: `0231BCA${formData.erpId}`
            };

            const res = await fetch("/api/auth/signup-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong.");
            }

            setMessage({ type: 'success', text: "Request submitted! Redirecting to login..." });

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);

            // Optional: clear form
            setFormData({
                fullName: "",
                email: "",
                enrollmentNo: "",
                erpId: "",
                courseYear: "",
                section: ""
            });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-md shadow-2xl border-zinc-200 dark:border-zinc-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight text-zinc-900 dark:text-zinc-50">Student Registration</CardTitle>
                    <CardDescription className="text-center text-zinc-500 dark:text-zinc-400">Request account access</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {message && (
                            <div className={`p-3 rounded text-sm font-medium ${message.type === 'success' ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-red-50 text-red-900 border border-red-100'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                            <Input name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" className="border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                            <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@college.edu" className="border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Enrollment No</label>
                                <div className="flex items-center">
                                    <span className="flex items-center justify-center px-3 py-2 text-sm border border-r-0 rounded-l-md bg-muted text-muted-foreground border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                                        0231BCA
                                    </span>
                                    <Input
                                        name="enrollmentNo"
                                        value={formData.enrollmentNo}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                                            setFormData({ ...formData, enrollmentNo: val, erpId: val });
                                        }}
                                        required
                                        placeholder="000"
                                        maxLength={3}
                                        className="rounded-l-none border-l-0 border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">ERP ID</label>
                                <div className="flex items-center">
                                    <span className="flex items-center justify-center px-3 py-2 text-sm border border-r-0 rounded-l-md bg-muted text-muted-foreground border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                                        0231BCA
                                    </span>
                                    <Input
                                        name="erpId"
                                        value={formData.erpId}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                                            setFormData({ ...formData, erpId: val, enrollmentNo: val });
                                        }}
                                        required
                                        placeholder="000"
                                        maxLength={3}
                                        className="rounded-l-none border-l-0 border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Course Year</label>
                                <Select value={formData.courseYear} onValueChange={(val) => handleSelectChange("courseYear", val)}>
                                    <SelectTrigger className="border-zinc-300 dark:border-zinc-700 focus:ring-zinc-900 dark:focus:ring-zinc-100">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Section</label>
                                <Select value={formData.section} onValueChange={(val) => handleSelectChange("section", val)}>
                                    <SelectTrigger className="border-zinc-300 dark:border-zinc-700 focus:ring-zinc-900 dark:focus:ring-zinc-100">
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={section.name}>{section.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Request"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Already registered? <Link href="/login" className="text-zinc-900 dark:text-zinc-50 font-medium hover:underline underline-offset-4">Log in</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
