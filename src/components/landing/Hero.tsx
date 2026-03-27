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
import { PlayCircle, Volume2, Settings, Maximize } from "lucide-react";

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
              className="w-full sm:w-auto rounded-full px-10 h-14 text-[#2d3338] hover:bg-[#ebeef2] text-base"
            >
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
        <DialogContent className="sm:max-w-[800px] border-none bg-slate-950 rounded-[32px] p-0 overflow-hidden shadow-2xl transition-all duration-500">
           <div className="relative aspect-video w-full bg-black group overflow-hidden">
              {/* Fake Video Player Grain/Overlay */}
              <div className="absolute inset-0 bg-[#0A0A0B] opacity-50" />
              
              {/* Play Button + Placeholder Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                 <div className="h-24 w-24 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-700 shadow-2xl">
                    <PlayCircle className="h-12 w-12 text-white/40 group-hover:text-white" fill="currentColor" />
                 </div>
                 <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                   Demo Preview
                 </h3>
                 <p className="text-slate-400 text-xl max-w-sm leading-relaxed font-medium">
                   "Currently we not have recorded Demo video Sorry!"
                 </p>
                 
                 <div className="mt-8 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-slate-500 text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    Pending Record
                 </div>
              </div>

              {/* Mock Video Controls (YouTube Style) */}
              <div className="absolute bottom-0 inset-x-0 p-4 pt-16 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 {/* Progress Bar */}
                 <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden relative group/progress cursor-pointer">
                    <div className="absolute left-0 top-0 h-full w-[0%] bg-blue-500 group-hover/progress:h-1.5 transition-all" />
                    <div className="absolute left-[30%] top-1/2 -translate-y-1/2 h-3 w-3 bg-blue-500 rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
                 </div>
                 
                 <div className="flex items-center justify-between text-white/80">
                    <div className="flex items-center gap-6">
                       <PlayCircle className="h-6 w-6 cursor-pointer hover:text-white transition-colors" />
                       <div className="flex items-center gap-4">
                          <Volume2 className="h-6 w-6 cursor-pointer hover:text-white transition-colors" />
                          <span className="text-sm font-medium tabular-nums">0:00 / 4:12</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                       <Settings className="h-6 w-6 cursor-pointer hover:text-white transition-colors" />
                       <Maximize className="h-6 w-6 cursor-pointer hover:text-white transition-colors" />
                    </div>
                 </div>
              </div>

              {/* Top Watermark */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-black shadow-lg">AP</div>
                 <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Attendance Portal</span>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
