"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sidebar as AdminSidebar } from "@/components/admin-sidebar";
import { FacultySidebar } from "@/components/faculty-sidebar";
import { useEffect, useState } from "react";

interface MobileSidebarProps {
    role: "admin" | "faculty";
}

export const MobileSidebar = ({ role }: MobileSidebarProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[#111827] text-white">
                <SheetHeader className="sr-only">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                {role === "admin" ? <AdminSidebar /> : <FacultySidebar />}
            </SheetContent>
        </Sheet>
    );
}
