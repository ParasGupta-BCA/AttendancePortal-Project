"use client";

import { CheckCircle2, QrCode, BellRing, RefreshCw } from "lucide-react";
import Image from "next/image";

const items = [
  { name: "One-tap QR Scanning", icon: QrCode },
  { name: "Automatic Late Notifications", icon: BellRing },
  { name: "Multi-campus Syncing", icon: RefreshCw },
];

export function Operations() {
  return (
    <section className="py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2d3338] mb-8 leading-[1.2]">
              The Hub of Operations
            </h2>
            <p className="text-lg text-[#2d3338]/60 mb-10 leading-relaxed">
              The interface is built to fade away, leaving only your data. With liquid transitions and tactile feedback, managing 10 or 10,000 users feels equally effortless.
            </p>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-lg font-medium text-[#2d3338]/80">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative w-full max-w-xl mx-auto">
            <div className="absolute -inset-10 bg-blue-500/5 blur-[100px] rounded-full -z-10" />
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#ebeef2]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xl font-bold text-[#2d3338]">Current Attendance</h4>
                  <p className="text-sm text-[#2d3338]/40">Monday, October 14</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { name: "Alex Rivers", time: "08:45 AM", initial: "A", color: "bg-blue-100 text-blue-600" },
                  { name: "Sarah Chen", time: "09:02 AM", initial: "S", color: "bg-purple-100 text-purple-600" },
                  { name: "Jordan Miller", time: "Expected at 09:30 AM", initial: "J", color: "bg-gray-100 text-gray-400" },
                ].map((user, i) => (
                  <div key={user.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${user.color} flex items-center justify-center font-bold text-lg`}>
                        {user.initial}
                      </div>
                      <div>
                        <p className="font-bold text-[#2d3338]">{user.name}</p>
                        <p className="text-sm text-[#2d3338]/40">{user.time}</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full ${i < 2 ? 'bg-blue-600' : 'bg-gray-100'} relative transition-colors`}>
                      <div className={`absolute top-1 ${i < 2 ? 'right-1' : 'left-1'} w-3 h-3 bg-white rounded-full shadow-sm`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
