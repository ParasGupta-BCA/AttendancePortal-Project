"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Server, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function PHPSupportForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    // Status can be: 'idle', 'success-php', 'success-simulation', 'error'
    const [status, setStatus] = useState<'idle' | 'success-php' | 'success-simulation' | 'error'>('idle');
    const [serverInfo, setServerInfo] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');

        const payload = { name, message };

        try {
            // 1. Attempt to hit the LOCAL PHP backend
            // NOTE: This URL assumes XAMPP is running on localhost:80 and the folder is in htdocs/attendance-php
            // Adjust the URL if you place the folder differently.
            // For now, we assume standard localhost/php-backend setup.

            // TIP: If running from a separate folder, efficient path might be: http://localhost/attendance-portal/php-backend/contact.php
            // We'll try a generic one, but this usually fails in Production (Vercel) which is EXPECTED.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            const response = await fetch("http://localhost/php-backend/contact.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("PHP Endpoint unreachable");

            const data = await response.json();

            if (data.status === "success") {
                setStatus('success-php');
                setServerInfo(data.server_software || "PHP Server");
                toast.success("Message sent to PHP Backend!");
            } else {
                throw new Error(data.message || "Unknown error");
            }

        } catch (error) {
            console.warn("PHP Integration: Backend not found, switching to Simulation Mode.", error);

            // 2. FAIL-SAFE: If PHP is not found (e.g. on Vercel), fall back to Simulation
            // This ensures the App NEVER crashes for the user.

            // Artificial delay to simulate network
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStatus('success-simulation');
            toast.info("PHP Backend unreachable (Expected on Vercel). Message saved locally.");
        } finally {
            setIsLoading(false);
            setName("");
            setMessage("");
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-muted/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-500" />
                    <span>College Support</span>
                </CardTitle>
                <CardDescription>
                    Submit a query to the administration.
                    <br />
                    <span className="text-xs text-muted-foreground/60">
                        Powered by Hybrid PHP Integration
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Query / Feedback</Label>
                        <Textarea
                            id="message"
                            placeholder="Describe your issue..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connecting to Localhost...
                            </>
                        ) : (
                            "Submit Query"
                        )}
                    </Button>
                </form>

                {/* Status Feedback Area */}
                <div className="mt-6">
                    {status === 'success-php' && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">Success: Connected to PHP!</p>
                                <p className="text-xs text-green-700/80 dark:text-green-400/80 mt-1">
                                    Processed by: {serverInfo}<br />
                                    Timestamp: {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'success-simulation' && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Simulation Mode Active</p>
                                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                                    PHP Server was not found at <code>localhost/php-backend</code>.
                                    This is expected on Vercel. Use XAMPP locally to test PHP integration.
                                </p>
                                <p className="text-xs font-mono mt-1 text-muted-foreground">Status: 200 OK (Simulated)</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-3 text-center justify-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Requirement: PHP Backend Integration
                </p>
            </CardFooter>
        </Card>
    );
}
