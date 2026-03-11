import { getServerSession } from "next-auth";
import { tuitionAuthOptions } from "@/lib/tuition-auth";
import { redirect } from "next/navigation";

export default async function TuitionDashboard() {
    // This fetches the session using the SUPABASE auth options
    const session = await getServerSession(tuitionAuthOptions);

    if (!session) {
        redirect('/tuition/login');
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Tuition Dashboard
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 mt-2">
                    Welcome back, {session.user?.name}
                </p>
                {/* 
                  To prove this is isolated, we can show their unique institution ID here.
                  This ID only exists in the Supabase database.
                */}
                <p className="text-xs text-gray-400 mt-1 font-mono">
                    Institution ID: {(session.user as any).institution_id}
                </p>
            </header>

            <main className="grid flex-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Students</h2>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage your enrolled students.</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Classes</h2>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage subjects and timetable.</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance</h2>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1">View and generate reports.</p>
                </div>
            </main>
        </div>
    );
}
