"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function TrustSection() {
  const logos = [
    { src: "/landing/logo-bvimr.png", alt: "BVIMR Logo", scale: "scale-100" },
    { src: "/landing/logo-tuition.png", alt: "Tuition Point Logo", scale: "scale-150" },
  ];

  return (
    <section className="py-16 bg-[#f8f9fb]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-[#2d3338]/30 mb-10">
            Empowering top-tier institutions across the region
          </p>
          
          <div className="relative group">
            {/* Logo Cloud Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative flex flex-wrap justify-center items-center gap-16 md:gap-32 px-10 py-12 bg-white border border-[#2d3338]/5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-500">
              {logos.map((logo, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className={`relative h-12 w-48 transition-all duration-500 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 ${logo.scale}`}
                >
                  <Image 
                    src={logo.src} 
                    alt={logo.alt} 
                    fill
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center items-center gap-4 text-[#2d3338]/20">
            <div className="h-[1px] w-12 bg-current" />
            <span className="text-[10px] font-medium tracking-widest uppercase">Institutional Excellence</span>
            <div className="h-[1px] w-12 bg-current" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
