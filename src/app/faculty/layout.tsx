import { Sidebar } from "@/components/admin-sidebar";

export default function FacultyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // In a real app we'd hide non-faculty routes in the sidebar based on role.
    // For now, reusing the layout is fine, or we can make a specific Faculty sidebar.
    // Let's assume specific sidebar is needed.
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72">
                {children}
            </main>
        </div>
    );
}
