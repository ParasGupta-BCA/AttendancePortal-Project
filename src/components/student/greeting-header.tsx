"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Actually, looking at package.json from history, "tw-animate-css" is there, but not "framer-motion". 
// I will use pure Tailwind CSS and React for the animation to keep it lightweight and consistent with the "no new deps unless needed" philosophy, unless the user specifically asked for a library on previous turns.
// The plan said "Tailwind CSS transition classes". So I will stick to that.

export function GreetingHeader() {
    const { data: session } = useSession();
    const [showGreeting, setShowGreeting] = useState(false);
    const [greeting, setGreeting] = useState("Good Morning");

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting("Good Morning");
            else if (hour < 17) setGreeting("Good Afternoon");
            else setGreeting("Good Evening");
        };

        updateGreeting();
        // Update greeting every minute just in case
        const timeInterval = setInterval(updateGreeting, 60000);

        // Toggle text every 5 seconds
        const toggleInterval = setInterval(() => {
            setShowGreeting(prev => !prev);
        }, 5000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(toggleInterval);
        };
    }, []);

    // Get the first name only for a cleaner look
    const firstName = session?.user?.name?.split(" ")[0] || "Student";

    return (
        <div className="h-8 overflow-hidden grid place-items-center relative justify-items-start">
            <div
                className={`col-start-1 row-start-1 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] transform ${showGreeting ? '-translate-y-full opacity-0 blur-sm scale-95' : 'translate-y-0 opacity-100 blur-0 scale-100'
                    }`}
            >
                <h1 className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap">
                    Student Portal
                </h1>
            </div>

            <div
                className={`col-start-1 row-start-1 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] transform ${showGreeting ? 'translate-y-0 opacity-100 blur-0 scale-100' : 'translate-y-full opacity-0 blur-sm scale-95'
                    }`}
            >
                <h1 className="font-bold text-lg text-gray-900 dark:text-white truncate max-w-[250px] whitespace-nowrap">
                    {greeting}, {firstName}
                </h1>
            </div>
        </div>
    );
}
