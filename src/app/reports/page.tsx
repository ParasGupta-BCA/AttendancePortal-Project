"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, AlertCircle, ArrowUpRight, Download } from "lucide-react";

const stats = [
  { label: "Overall Attendance", value: "94.2%", change: "+2.1%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Late Entries", value: "12", change: "-5%", icon: AlertCircle, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Active Students", value: "1,284", change: "+12", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
          >
            <div>
              <span className="inline-block px-4 py-1.5 mb-6 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#2d3338]/50 bg-[#ebeef2] rounded-full">
                Data-Driven Insights
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#2d3338] mb-4">
                Institutional Reports
              </h1>
              <p className="text-lg text-[#2d3338]/60 max-w-2xl">
                Real-time visibility into your organization's performance. 
                Everything you need to make informed, data-backed decisions.
              </p>
            </div>
            
            <button className="flex items-center gap-2 px-6 h-12 bg-white border border-[#2d3338]/10 rounded-full text-sm font-bold text-[#2d3338] hover:bg-[#f3f4f6] transition-all">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-[#2d3338]/5 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-[#2d3338]/40 text-sm font-bold tracking-wider uppercase mb-2">{stat.label}</p>
                <p className="text-4xl font-black text-[#2d3338]">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Mock Chart Area 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-[#2d3338]/5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold text-[#2d3338]">Attendance Activity</h3>
                <BarChart3 className="w-5 h-5 text-[#2d3338]/20" />
              </div>
              <div className="h-64 flex items-end gap-3 px-4">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl opacity-80"
                  />
                ))}
              </div>
              <div className="flex justify-between mt-6 px-4 text-[10px] font-bold text-[#2d3338]/30 uppercase tracking-widest">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </motion.div>

            {/* Mock Chart Area 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-[#2d3338]/5 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold text-[#2d3338]">Regional Performance</h3>
                <ArrowUpRight className="w-5 h-5 text-[#2d3338]/20" />
              </div>
              <div className="space-y-8">
                {[
                  { name: "North Wing", val: "98%", color: "bg-blue-600" },
                  { name: "South Campus", val: "91%", color: "bg-purple-600" },
                  { name: "Science Lab", val: "84%", color: "bg-emerald-600" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-[#2d3338]/60">{item.name}</span>
                      <span className="text-sm font-black text-[#2d3338]">{item.val}</span>
                    </div>
                    <div className="h-2 w-full bg-[#ebeef2] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: item.val }}
                        transition={{ duration: 1.5, delay: 0.5 + (i * 0.2) }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
