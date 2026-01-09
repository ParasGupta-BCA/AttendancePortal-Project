import { PHPSupportForm } from "@/components/php-support-form";

export default function SupportPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Student Support
                </h1>
                <p className="text-muted-foreground">
                    Direct line to administrative services
                </p>
            </div>

            <PHPSupportForm />
        </div>
    );
}
