"use client";

import { ChangePasswordForm } from "@/components/change-password-form";
import { ChangeEmailForm } from "@/components/change-email-form";

export default function FacultySettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Settings</h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
                <ChangePasswordForm />
                <ChangeEmailForm />
            </div>
        </div>
    );
}
