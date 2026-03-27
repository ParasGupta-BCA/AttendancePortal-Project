import React from "react";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

export default function MacbookScrollDemo() {
  return (
    <div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
      <MacbookScroll
        title={""}
        badge={
          <div className="h-10 w-10 -rotate-12 transform bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
             <span className="font-bold text-lg">AP</span>
          </div>
        }
        src={`/landing/dashboard-preview.png`}
        showGradient={false}
      />
    </div>
  );
}
