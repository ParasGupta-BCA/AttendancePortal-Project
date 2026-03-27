"use client";

import Image from "next/image";

export function TrustSection() {
  return (
    <section className="py-20 bg-white/50">
      <div className="container mx-auto px-6">
        <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-[#2d3338]/40 mb-12">
          Trusted by Global Leaders
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <Image 
            src="/landing/logo-bvimr.png" 
            alt="BVIMR Logo" 
            width={160} 
            height={60} 
            className="h-10 w-auto object-contain"
          />
          <Image 
            src="/landing/logo-tuition.png" 
            alt="Tuition Point Logo" 
            width={160} 
            height={60} 
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
