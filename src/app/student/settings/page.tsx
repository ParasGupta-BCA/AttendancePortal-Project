"use client";

import { ChangePasswordForm } from "@/components/change-password-form";

export default function StudentSettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 pt-6">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Settings</h2>
            <ChangePasswordForm />
        </div>
    );
}
