"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, MapPin, Sparkles, Layout, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const benefits = [
  { title: "Smart Conflict Detection", desc: "Our engine automatically flags overlapping schedules for zero downtime.", icon: Zap },
  { title: "Multi-Campus Sync", desc: "Manage multiple wings and departments from a single source of truth.", icon: Layers },
  { title: "Liquid Transitions", desc: "Experience the smoothest timeline navigation ever built for education.", icon: Sparkles },
];

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb] overflow-hidden">
      <Navbar />
      
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 rounded-full">
              Institutional Rhythm
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#2d3338] mb-8 max-w-4xl mx-auto leading-[1.1]">
              Master Your Time with <span className="text-blue-600">Precision</span>
            </h1>
            <p className="text-lg md:text-xl text-[#2d3338]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Eliminate coordination gaps with our high-fidelity scheduling engine. 
              Designed for clarity, built for massive institutional scale.
            </p>
            
            <div className="flex justify-center gap-4 mb-20">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-10 h-14 bg-[#1a1f24] hover:bg-[#2d3338] text-white text-base">
                  Try it Now
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Main Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative max-w-5xl mx-auto mb-32"
          >
            <div className="absolute -inset-10 bg-gradient-to-b from-blue-500/10 to-purple-500/5 blur-[120px] rounded-full -z-10" />
            
            <div className="bg-white/40 backdrop-blur-xl p-4 sm:p-8 rounded-[3rem] border border-white/50 shadow-2xl">
              <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-[#ebeef2]">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Layout className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xl font-bold text-[#2d3338]">Today's Routine</h4>
                      <p className="text-sm text-[#2d3338]/40">Monday, October 14</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#2d3338]/20">
                    Live Updates Active
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { time: "09:00 AM", subject: "Quantum Theory", room: "Hall A", color: "bg-blue-600" },
                    { time: "11:30 AM", subject: "Discrete Math", room: "Lab 203", color: "bg-purple-600" },
                    { time: "02:00 PM", subject: "Neural Networks", room: "Room 101", color: "bg-emerald-600" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[2rem] bg-[#f8f9fb] border border-[#2d3338]/5 group hover:bg-white hover:shadow-lg transition-all duration-500">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-blue-600 mb-1">{item.time}</span>
                          <div className={`w-1 h-8 ${item.color} rounded-full opacity-20`} />
                        </div>
                        <div>
                          <h5 className="text-xl font-bold text-[#2d3338]">{item.subject}</h5>
                          <div className="flex items-center gap-2 text-sm text-[#2d3338]/40 font-medium mt-1">
                            <MapPin className="w-4 h-4" />
                            {item.room}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-xs font-bold text-[#2d3338]/60 uppercase tracking-tighter">In Progress</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-white border border-[#2d3338]/5 hover:shadow-xl transition-all duration-500 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#f8f9fb] flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#2d3338] mb-4">{benefit.title}</h3>
                <p className="text-[#2d3338]/60 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
