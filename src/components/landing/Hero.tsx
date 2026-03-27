"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlayCircle, AlertCircle } from "lucide-react";

export function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-20 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2d3338]/50 bg-[#ebeef2] rounded-full">
            The Future of Productivity
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#2d3338] mb-6 md:mb-8 max-w-4xl mx-auto leading-[1.2] md:leading-[1.1]">
            Effortless Attendance tracking for the Modern Institution
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#2d3338]/60 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4 md:px-0">
            Streamline your organization with our high-fidelity tracking system.
            Designed for clarity, built for speed, and refined for the modern workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-20">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-10 h-14 bg-[#1a1f24] hover:bg-[#2d3338] text-white text-base">
                Get Started
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="ghost" 
              onClick={() => setIsVideoOpen(true)}
              className="w-full sm:w-auto rounded-full px-10 h-14 text-[#2d3338] hover:bg-[#ebeef2] text-base group"
            >
              <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Watch Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/10 to-purple-500/5 blur-3xl rounded-3xl -z-10" />
          <div className="relative bg-white/40 backdrop-blur-md p-2 rounded-3xl border border-white/50 shadow-2xl">
            <Image
              src="/landing/dashboard-preview.png"
              alt="Dashboard Preview"
              width={1200}
              height={800}
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Video Demo Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-[600px] border-none bg-white/80 backdrop-blur-2xl rounded-3xl p-0 overflow-hidden shadow-2xl">
           <div className="aspect-video w-full bg-slate-900/10 flex flex-col items-center justify-center p-12 text-center group">
              <div className="h-20 w-20 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner border border-white/20 group-hover:scale-110 transition-transform duration-500">
                 <AlertCircle className="h-10 w-10 text-[#2d3338]/40" />
              </div>
              <h3 className="text-2xl font-bold text-[#2d3338] mb-3">
                Watch Demo
              </h3>
              <p className="text-[#2d3338]/60 text-lg max-w-xs leading-relaxed">
                Currently we not have recorded Demo video Sorry!
              </p>
              
              <div className="mt-8 flex gap-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30 animate-pulse" />
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30 animate-pulse delay-75" />
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30 animate-pulse delay-150" />
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
