"use client";

import { motion } from "framer-motion";
import { History, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Real-time Logs",
    description: "Experience zero-latency updates. Every entry is recorded and synced instantly across all management devices.",
    icon: History,
  },
  {
    title: "Secure Management",
    description: "End-to-end encrypted data handling ensures that student and staff records remain private and tamper-proof.",
    icon: ShieldCheck,
  },
  {
    title: "Automated Reports",
    description: "Generate complex attendance analytics with a single click. Beautiful PDFs and CSVs ready for your next meeting.",
    icon: BarChart3,
  },
];

export function Features() {
  return (
    <section className="py-32">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-10 rounded-[2.5rem] bg-[#f9f9fb] border border-transparent hover:border-[#dde3e9] hover:bg-white hover:shadow-xl transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#2d3338] mb-4">{feature.title}</h3>
              <p className="text-[#2d3338]/60 leading-relaxed text-balance">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
