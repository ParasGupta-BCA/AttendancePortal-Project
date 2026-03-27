"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, ChevronRight, LogOut, Camera } from "lucide-react";

export default function SettingsPage() {
  const sections = [
    { title: "Personal Profile", icon: User, items: ["Account Information", "Profile Visibility"] },
    { title: "Notifications", icon: Bell, items: ["Push Notifications", "Email Alerts", "Weekly Digests"] },
    { title: "Security", icon: Shield, items: ["Password Reset", "Two-Factor Auth", "Device History"] },
    { title: "Interface", icon: Palette, items: ["Liquid Glass Theme", "Dark Mode", "Reduced Motion"] },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2d3338]/50 bg-[#ebeef2] rounded-full">
              Your Workspace
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#2d3338] mb-6">
              Global Settings
            </h1>
            <p className="text-lg text-[#2d3338]/60 max-w-2xl mx-auto">
              Configure your Attendance Portal experience. 
              Refined controls for a personalized workflow.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* User Profile Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] border border-white shadow-xl mb-12 flex flex-col sm:flex-row items-center gap-8"
            >
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-4xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                  PG
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#dde3e9] flex items-center justify-center text-[#2d3338] shadow-md hover:bg-blue-600 hover:text-white transition-all">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-black text-[#2d3338]">Paras Gupta</h3>
                <p className="text-[#2d3338]/40 font-bold text-sm tracking-wider uppercase mb-4">Administrator • BCC-01-A</p>
                <button className="text-blue-600 font-bold text-sm hover:underline">View Public Profile</button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sections.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-[#2d3338]/5 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <section.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#2d3338]">{section.title}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <button
                        key={item}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/60 transition-all group"
                      >
                        <span className="text-sm font-bold text-[#2d3338]/60 group-hover:text-[#2d3338] transition-colors">
                          {item}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#2d3338]/20 group-hover:text-blue-600 transition-all" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 flex justify-center"
            >
              <button className="flex items-center gap-3 px-8 h-14 rounded-full text-purple-600 font-bold hover:bg-purple-50 transition-all">
                <LogOut className="w-5 h-5" />
                Sign out of Portal
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
