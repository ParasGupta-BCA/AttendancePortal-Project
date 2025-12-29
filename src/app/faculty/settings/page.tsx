"use client";

import { ChangePasswordForm } from "@/components/change-password-form";

export default function FacultySettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <ChangePasswordForm />
        </div>
    );
}
