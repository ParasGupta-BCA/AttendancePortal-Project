"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        enrollmentNo: "",
        erpId: "",
        courseYear: "BCA VI", // Default
        section: "Morning"   // Default
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
            const res = await fetch("/api/auth/signup-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
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
                courseYear: "BCA VI",
                section: "Morning"
            });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Student Registration</CardTitle>
                    <CardDescription>Request account access from administration</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {message && (
                            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@college.edu" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Enrollment No</label>
                                <Input name="enrollmentNo" value={formData.enrollmentNo} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ERP ID</label>
                                <Input name="erpId" value={formData.erpId} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course Year</label>
                                <Select value={formData.courseYear} onValueChange={(val) => handleSelectChange("courseYear", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BCA I">BCA I</SelectItem>
                                        <SelectItem value="BCA II">BCA II</SelectItem>
                                        <SelectItem value="BCA III">BCA III</SelectItem>
                                        <SelectItem value="BCA IV">BCA IV</SelectItem>
                                        <SelectItem value="BCA V">BCA V</SelectItem>
                                        <SelectItem value="BCA VI">BCA VI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Section</label>
                                <Select value={formData.section} onValueChange={(val) => handleSelectChange("section", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Morning">Morning</SelectItem>
                                        <SelectItem value="Afternoon">Afternoon</SelectItem>
                                        <SelectItem value="Evening">Evening</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Request"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Already registered? <Link href="/login" className="text-indigo-600 hover:underline">Log in</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
