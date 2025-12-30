"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SessionGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If user is unauthenticated and not already on a public page
        if (status === "unauthenticated" && pathname !== "/login" && pathname !== "/setup-password") {
            router.push("/login");
        }
    }, [status, pathname, router]);

    return <>{children}</>;
}
