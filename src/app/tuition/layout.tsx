'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { TuitionSidebar } from "@/components/tuition-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default function TuitionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/tuition/login' || pathname === '/tuition/register';

    if (isLoginPage) {
        // No sidebar for login/register pages
        return <>{children}</>;
    }

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <TuitionSidebar />
            </div>
            <main className="md:pl-72">
                <div className="flex items-center p-4 md:hidden">
                    <MobileSidebar role="tuition" />
                </div>
                {children}
            </main>
        </div>
    );
}
