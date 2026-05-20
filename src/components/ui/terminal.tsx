import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const Terminal = ({
    children,
    title = "Terminal",
    className,
}: {
    children: React.ReactNode;
    title?: string;
    className?: string;
}) => {
    return (
        <div className={cn("glass overflow-hidden rounded-2xl shadow-2xl relative", className)}>
            {/* Decorative glow inside */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-magenta/10 blur-[80px] pointer-events-none" />

            {/* Title Bar */}
            <div className="relative z-10 flex items-center gap-3 border-b border-[var(--magenta)]/20 bg-black/40 px-5 py-4">
                <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-[0_0_10px_rgba(255,95,86,0.3)]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-[0_0_10px_rgba(255,189,46,0.3)]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-[0_0_10px_rgba(39,201,63,0.3)]"></div>
                </div>
                <div className="ml-2 font-mono text-[11px] text-muted-foreground uppercase tracking-widest opacity-80">{title}</div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 min-h-[220px] bg-[#0a090d]/95 p-6 font-mono text-[13px] leading-relaxed text-white/90 selection:bg-magenta/30 selection:text-white">
                {children}

                {/* Subtle scanline effect overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20" />
            </div>
        </div>
    );
};

export const TypingLine = ({
    text,
    prompt = "$",
    delay = 0,
}: {
    text: string;
    prompt?: string;
    delay?: number;
}) => {
    const [visible, setVisible] = useState(false);
    const [typed, setTyped] = useState("");

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (delay > 0) {
            timeout = setTimeout(() => setVisible(true), delay);
        } else {
            setVisible(true);
        }
        return () => clearTimeout(timeout);
    }, [delay]);

    useEffect(() => {
        if (!visible) return;
        let index = 0;
        const interval = setInterval(() => {
            setTyped(text.slice(0, index + 1));
            index++;
            if (index >= text.length) clearInterval(interval);
        }, 35); // Slightly faster typing for better UX
        return () => clearInterval(interval);
    }, [visible, text]);

    if (!visible && delay > 0) return <div className="h-5"></div>;

    return (
        <div className="flex items-start gap-3 mt-3">
            <span className="text-magenta font-bold">{prompt}</span>
            <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{typed}</span>
            <span className="w-2 h-4 bg-white/60 animate-pulse mt-0.5" /> {/* Cursor */}
        </div>
    );
};

export const OutputLine = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <div className={cn("mt-1.5 pl-6 border-l border-white/5 text-muted-foreground transition-all duration-500", className)}>{children}</div>;
};
