"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const shadowY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const shadowScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 1], [0.15, 0.05]);
  const imageRotate = useTransform(scrollYProgress, [0, 1], [0, -2]);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2d3338]/50 bg-[#ebeef2] rounded-full">
            The Future of Productivity
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#2d3338] mb-8 max-w-4xl mx-auto leading-[1.1]">
            Effortless Attendance tracking for the Modern Institution
          </h1>
          <p className="text-lg md:text-xl text-[#2d3338]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Streamline your organization with our high-fidelity tracking system.
            Designed for clarity, built for speed, and refined for the modern workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/login">
              <Button size="lg" className="rounded-full px-10 h-14 bg-[#1a1f24] hover:bg-[#2d3338] text-white text-base">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="rounded-full px-10 h-14 text-[#2d3338] hover:bg-[#ebeef2] text-base">
              Watch Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ rotateX: imageRotate }}
          className="relative max-w-5xl mx-auto perspective-1000"
        >
          {/* Moving Shadow */}
          <motion.div 
            style={{ 
              y: shadowY, 
              scale: shadowScale, 
              opacity: shadowOpacity 
            }}
            className="absolute -inset-10 bg-black blur-[100px] rounded-full -z-10"
          />
          
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
    </section>
  );
}
