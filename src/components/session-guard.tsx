"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SessionGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Public paths that don't require authentication
        const publicPaths = ["/", "/login", "/signup", "/setup-password", "/forgot-password", "/reset-password", "/tuition/login", "/tuition/register", "/register-tuition"];

        // If user is unauthenticated and not on a public page
        if (status === "unauthenticated" && !publicPaths.includes(pathname)) {
            router.push("/login");
        }
    }, [status, pathname, router]);

    return <>{children}</>;
}
