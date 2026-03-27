"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, BookOpen, MapPin } from "lucide-react";

const scheduleData = [
  {
    day: "Monday",
    classes: [
      { time: "09:00 AM - 10:30 AM", subject: "Advanced Physics", room: "Room 402", instructor: "Dr. Smith" },
      { time: "11:00 AM - 12:30 PM", subject: "Quantum Computing", room: "Lab 1", instructor: "Prof. Miller" },
      { time: "02:00 PM - 03:30 PM", subject: "Data Structures", room: "Room 101", instructor: "Dr. Jones" },
    ]
  },
  {
    day: "Tuesday",
    classes: [
      { time: "10:00 AM - 11:30 AM", subject: "Linear Algebra", room: "Room 205", instructor: "Prof. Garcia" },
      { time: "01:00 PM - 02:30 PM", subject: "Web Development", room: "Lab 3", instructor: "Dr. Lee" },
    ]
  },
  {
    day: "Wednesday",
    classes: [
      { time: "09:00 AM - 10:30 AM", subject: "Artificial Intelligence", room: "Room 303", instructor: "Dr. Wang" },
      { time: "12:00 PM - 01:30 PM", subject: "Software Engineering", room: "Room 401", instructor: "Prof. Gupta" },
    ]
  }
];

export default function SchedulePage() {
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
              Full Transparency
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#2d3338] mb-6">
              Institutional Schedule
            </h1>
            <p className="text-lg text-[#2d3338]/60 max-w-2xl mx-auto">
              Stay ahead of your routine with our high-fidelity timeline. 
              Designed for clarity and updated in real-time.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-12">
            {scheduleData.map((day, dayIdx) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: dayIdx * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2d3338]">{day.day}</h2>
                </div>

                <div className="grid gap-6">
                  {day.classes.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      className="group relative bg-white/40 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-[#2d3338]/5 hover:border-blue-500/20 shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3 text-blue-600 font-bold text-sm tracking-wide">
                            <Clock className="w-4 h-4" />
                            {item.time}
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-[#2d3338] group-hover:text-blue-600 transition-colors">
                            {item.subject}
                          </h3>
                          <div className="flex flex-wrap items-center gap-6 text-[#2d3338]/50 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {item.room}
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              {item.instructor}
                            </div>
                          </div>
                        </div>
                        
                        <div className="hidden sm:block">
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
