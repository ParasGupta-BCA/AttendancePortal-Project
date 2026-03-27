"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Shield, Smartphone, Globe, Lock, Key, Eye, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const configurations = [
  { title: "256-bit Encryption", desc: "Military-grade security for your data.", icon: Lock },
  { title: "Global CDN", desc: "Ultra-fast response times across the globe.", icon: Globe },
  { title: "Privacy First", desc: "Strict data sovereignty and GDPR compliance.", icon: Eye },
];

export default function SettingsPage() {
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
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 rounded-full">
              Full Governance
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#2d3338] mb-8 max-w-4xl mx-auto leading-[1.1]">
              Your Workspace, Your <span className="text-emerald-600">Rules</span>
            </h1>
            <p className="text-lg md:text-xl text-[#2d3338]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Fine-tune your institutional ecosystem with granular security and privacy controls. 
              Refined settings for a secure, professional management experience.
            </p>
            
            <div className="flex justify-center gap-4 mb-20">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-10 h-14 bg-[#1a1f24] hover:bg-[#2d3338] text-white text-base">
                  Secure Your App
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
            <div className="absolute -inset-10 bg-gradient-to-b from-emerald-500/10 to-blue-500/5 blur-[120px] rounded-full -z-10" />
            
            <div className="bg-white/40 backdrop-blur-xl p-4 sm:p-8 rounded-[3rem] border border-white/50 shadow-2xl">
              <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-[#ebeef2]">
                <div className="grid lg:grid-cols-2 gap-10 text-left">
                  {/* Security Card */}
                  <div className="p-8 rounded-[2rem] bg-[#f8f9fb] border border-[#2d3338]/5">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-bold text-[#2d3338]">Privacy & Safety</h4>
                    </div>
                    <div className="space-y-4">
                      {[
                        { l: "Two-Factor Authentication", on: true, i: Key },
                        { l: "Anonymous Data Mode", on: false, i: Eye },
                        { l: "Institutional Access Guard", on: true, i: UserCheck },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-[#2d3338]/5">
                          <div className="flex items-center gap-3">
                            <s.i className="w-4 h-4 text-[#2d3338]/40" />
                            <span className="text-sm font-bold text-[#2d3338]/70">{s.l}</span>
                          </div>
                          <div className={`w-8 h-4 rounded-full ${s.on ? 'bg-emerald-600' : 'bg-gray-200'} relative`}>
                            <div className={`absolute top-0.5 ${s.on ? 'right-0.5' : 'left-0.5'} w-3 h-3 bg-white rounded-full shadow-sm`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device Control Card */}
                  <div className="p-8 rounded-[2rem] bg-[#f8f9fb] border border-[#2d3338]/5">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-bold text-[#2d3338]">Device Ecosystem</h4>
                    </div>
                    <div className="relative h-32 flex items-center justify-center gap-8">
                      <div className="w-16 h-24 rounded-xl bg-white border border-[#2d3338]/10 shadow-sm flex items-center justify-center">
                        <div className="w-10 h-1 bg-[#f8f9fb] rounded-full mt-auto mb-2" />
                      </div>
                      <div className="w-32 h-20 rounded-xl bg-white border border-blue-600 flex items-center justify-center shadow-lg relative">
                        <div className="w-1 h-1 bg-blue-600 rounded-full absolute top-2 right-2" />
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Site</div>
                      </div>
                    </div>
                    <p className="text-xs text-center text-[#2d3338]/40 font-medium mt-6">All devices synced via Attendance Portal Cloud.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
            {configurations.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-white border border-[#2d3338]/5 hover:shadow-xl transition-all duration-500 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#f8f9fb] flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
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
