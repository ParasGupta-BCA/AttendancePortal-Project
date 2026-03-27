"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 md:p-4">
      <div className="flex items-center justify-between w-full max-w-7xl px-4 md:px-6 py-2 md:py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-full shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-base md:text-xl font-bold tracking-tight text-[#2d3338] whitespace-nowrap">Attendance Portal</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium text-[#2d3338]/70 hover:text-[#2d3338] transition-colors">Dashboard</Link>
          <Link href="#" className="text-sm font-medium text-[#2d3338]/70 hover:text-[#2d3338] transition-colors">Schedule</Link>
          <Link href="#" className="text-sm font-medium text-[#2d3338]/70 hover:text-[#2d3338] transition-colors">Reports</Link>
          <Link href="#" className="text-sm font-medium text-[#2d3338]/70 hover:text-[#2d3338] transition-colors">Settings</Link>
        </div>

        <div>
          <Link href="/login">
            <Button className="rounded-full px-4 md:px-6 h-9 md:h-10 bg-[#1a1f24] hover:bg-[#2d3338] text-white border-none text-xs md:text-sm">
              Login/Signup
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
