"use client";

import { AnnouncementManagement } from "@/components/shared/announcement-management";

export default function AdminAnnouncementsPage() {
    return (
        <div className="p-8">
            <AnnouncementManagement apiBase="/api/tuition" />
        </div>
    );
}
