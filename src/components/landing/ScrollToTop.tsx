"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Force immediate scroll to top on path change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Using instant for marketing-style navigation feel
    });
  }, [pathname]);

  return null;
}
