"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-20 bg-white border-t border-[#ebeef2]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-xl font-bold text-[#2d3338] mb-2">Attendance Portal</h3>
            <p className="text-sm text-[#2d3338]/40">
              © {new Date().getFullYear()} ATTENDANCE PORTAL. DESIGNED FOR CLARITY.
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="#" className="text-xs font-bold tracking-widest uppercase text-[#2d3338]/40 hover:text-[#2d3338] transition-colors">Privacy</Link>
            <Link href="#" className="text-xs font-bold tracking-widest uppercase text-[#2d3338]/40 hover:text-[#2d3338] transition-colors">Terms</Link>
            <Link href="#" className="text-xs font-bold tracking-widest uppercase text-[#2d3338]/40 hover:text-[#2d3338] transition-colors">Security</Link>
            <Link href="#" className="text-xs font-bold tracking-widest uppercase text-[#2d3338]/40 hover:text-[#2d3338] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
