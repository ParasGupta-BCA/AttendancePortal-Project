"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { scrollY } = useScroll();
  
  // Animate padding and background opacity based on scroll
  const navPadding = useTransform(scrollY, [0, 50], ["1rem", "0.5rem"]);
  const navBgOpacity = useTransform(scrollY, [0, 50], ["0.7", "0.9"]);
  const navShadow = useTransform(
    scrollY, 
    [0, 50], 
    ["0px 10px 15px -3px rgba(0, 0, 0, 0)", "0px 10px 15px -3px rgba(0, 0, 0, 0.1)"]
  );

  return (
    <motion.nav 
      style={{ padding: navPadding }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center"
    >
      <motion.div 
        style={{ 
          backgroundColor: `rgba(255, 255, 255, ${navBgOpacity.get()})`,
          boxShadow: navShadow
        }}
        className="flex items-center justify-between w-full max-w-7xl px-6 py-3 backdrop-blur-xl border border-white/20 rounded-full"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#2d3338]">Attendance Portal</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium text-[#2d3338]/70 hover:text-[#2d3338] transition-colors">Dashboard</Link>
          <Link href="#" className="text-sm font-medium text-[#2d3338]/70 hover:text-[#2d3338] transition-colors">Schedule</Link>
          <Link href="#" className="text-sm font-medium text-[#2d3338]/70 hover:text-[#2d3338] transition-colors">Reports</Link>
          <Link href="#" className="text-sm font-medium text-[#2d3338]/70 hover:text-[#2d3338] transition-colors">Settings</Link>
        </div>

        <div>
          <Link href="/login">
            <Button className="rounded-full px-6 bg-[#1a1f24] hover:bg-[#2d3338] text-white border-none">
              Login/Signup
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
}
