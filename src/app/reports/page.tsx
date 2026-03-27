"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ShieldCheck, Download, PieChart, Info, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  { title: "Visual Analytics", desc: "Turn raw data into beautiful, actionable 3D visualizations instantly.", icon: PieChart },
  { title: "Export Anywhere", desc: "One-click exports to CSV, PDF, and specialized management formats.", icon: Download },
  { title: "Secure Insights", desc: "Enterprise-grade encryption for all institutional performance data.", icon: ShieldCheck },
];

export default function ReportsPage() {
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
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-purple-600 bg-purple-50 rounded-full">
              Intelligence Flow
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#2d3338] mb-8 max-w-4xl mx-auto leading-[1.1]">
              Deep Insights for <span className="text-purple-600">Smart</span> Decisions
            </h1>
            <p className="text-lg md:text-xl text-[#2d3338]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform your organization's behavior into visual intelligence. 
              Real-time analytics designed for high-stakes institutional leadership.
            </p>
            
            <div className="flex justify-center gap-4 mb-20">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-10 h-14 bg-[#1a1f24] hover:bg-[#2d3338] text-white text-base">
                  Explore Analytics
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
            <div className="absolute -inset-10 bg-gradient-to-b from-purple-500/10 to-blue-500/5 blur-[120px] rounded-full -z-10" />
            
            <div className="bg-white/40 backdrop-blur-xl p-4 sm:p-8 rounded-[3rem] border border-white/50 shadow-2xl">
              <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-[#ebeef2]">
                <div className="flex flex-col lg:flex-row gap-10">
                  {/* Stats Sidebar */}
                  <div className="lg:w-1/3 space-y-6">
                    {[
                      { l: "Attendance", v: "98.4%", c: "text-emerald-600", bg: "bg-emerald-50" },
                      { l: "Retention", v: "92.1%", c: "text-blue-600", bg: "bg-blue-50" },
                      { l: "Late Rate", v: "2.4%", c: "text-purple-600", bg: "bg-purple-50" },
                    ].map((s, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-[#f8f9fb] border border-[#2d3338]/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#2d3338]/30 mb-2">{s.l}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-black text-[#2d3338]">{s.v}</span>
                          <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ${s.c}`}>
                            <TrendingUp className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Chart Mock */}
                  <div className="lg:w-2/3">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-bold text-[#2d3338]">Weekly Growth</h4>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#f8f9fb] border border-[#2d3338]/5 flex items-center justify-center text-[#2d3338]/30">
                          <Info className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-[#f8f9fb] border border-[#2d3338]/5 flex items-center justify-center text-[#2d3338]/30">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="h-64 flex items-end gap-3 px-4 relative">
                      {[30, 60, 40, 80, 50, 90, 70, 85].map((h, i) => (
                        <div key={i} className="flex-1 group relative">
                          <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            transition={{ duration: 1.5, delay: i * 0.1 }}
                            className="bg-gradient-to-t from-purple-600 to-blue-400 rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4 text-[10px] font-bold text-[#2d3338]/20 tracking-[0.2em] uppercase">
                      <span>Wk 01</span><span>Wk 02</span><span>Wk 03</span><span>Wk 04</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-white border border-[#2d3338]/5 hover:shadow-xl transition-all duration-500 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#f8f9fb] flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#2d3338] mb-4">{item.title}</h3>
                <p className="text-[#2d3338]/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
