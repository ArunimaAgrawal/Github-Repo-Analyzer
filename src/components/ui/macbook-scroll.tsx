import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * MacbookScroll — inspired by Aceternity UI.
 * Animates a laptop opening (lid rotating up) and scaling as the user scrolls.
 */
export function MacbookScroll({
    title,
    src,
    showGradient = true,
    children,
}: {
    title?: ReactNode;
    src?: string;
    showGradient?: boolean;
    children?: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const scaleX = useTransform(scrollYProgress, [0, 0.3], [1.2, 1.5]);
    const scaleY = useTransform(scrollYProgress, [0, 0.3], [0.6, 1.5]);
    const translate = useTransform(scrollYProgress, [0, 1], [0, 1500]);
    const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
    const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div
            ref={ref}
            className="relative flex h-[180vh] shrink-0 scale-[0.55] flex-col items-center justify-start py-0 [perspective:800px] sm:scale-75 md:scale-100"
        >
            <motion.h2
                style={{ translateY: textTransform, opacity: textOpacity }}
                className="mb-12 text-center font-display text-4xl font-bold md:text-6xl"
            >
                {title ?? (
                    <span>
                        Your repo, <span className="text-grad">opened up.</span>
                    </span>
                )}
            </motion.h2>

            {/* Lid */}
            <Lid src={src} scaleX={scaleX} scaleY={scaleY} rotate={rotate} translate={translate}>
                {children}
            </Lid>

            {/* Base / keyboard */}
            <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#272729]">
                {/* Top notch / speaker grill */}
                <div className="relative h-10 w-full">
                    <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
                </div>
                <div className="relative flex">
                    <div className="mx-auto h-full w-[10%] overflow-hidden">
                        <SpeakerGrid />
                    </div>
                    <div className="mx-auto h-full w-[80%]">
                        <Keypad />
                    </div>
                    <div className="mx-auto h-full w-[10%] overflow-hidden">
                        <SpeakerGrid />
                    </div>
                </div>
                <Trackpad />
                <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tr-3xl rounded-tl-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
                {showGradient && (
                    <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-background via-background to-transparent" />
                )}
            </div>
        </div>
    );
}

function Lid({
    scaleX,
    scaleY,
    rotate,
    translate,
    src,
    children,
}: {
    scaleX: MotionValue<number>;
    scaleY: MotionValue<number>;
    rotate: MotionValue<number>;
    translate: MotionValue<number>;
    src?: string;
    children?: ReactNode;
}) {
    return (
        <div className="relative [perspective:800px]">
            <div
                style={{
                    transform: "perspective(800px) rotateX(-25deg) translateZ(0)",
                    transformOrigin: "bottom",
                    transformStyle: "preserve-3d",
                }}
                className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
            >
                <div
                    style={{ boxShadow: "0px 2px 0px 2px var(--color-border) inset" }}
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
                >
                    <span className="font-display text-white">⌬</span>
                </div>
            </div>
            <motion.div
                style={{
                    scaleX,
                    scaleY,
                    rotateX: rotate,
                    translateY: translate,
                    transformStyle: "preserve-3d",
                    transformOrigin: "top",
                }}
                className="absolute inset-0 h-96 w-[32rem] rounded-2xl bg-[#010101] p-2"
            >
                <div className="absolute inset-0 rounded-lg bg-[#272729]" />
                {src ? (
                    <img
                        src={src}
                        alt="screen"
                        className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top"
                    />
                ) : (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">{children}</div>
                )}
            </motion.div>
        </div>
    );
}

function Trackpad() {
    return (
        <div
            className="mx-auto my-1 h-32 w-[40%] rounded-xl"
            style={{ boxShadow: "0px 0px 1px 1px #00000020 inset" }}
        />
    );
}

function Keypad() {
    return (
        <div className="mx-1 h-full rounded-md bg-[#050505] p-1">
            {Array.from({ length: 5 }).map((_, r) => (
                <div key={r} className="mb-[2px] flex w-full shrink-0 gap-[2px]">
                    {Array.from({ length: 14 }).map((_, c) => (
                        <KBtn key={c} />
                    ))}
                </div>
            ))}
        </div>
    );
}

function KBtn({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "rounded-[4px] bg-[#0A090D] p-[0.5px] [transform:translateZ(0)] [will-change:transform]",
                "h-6 w-6",
                className,
            )}
        >
            <div
                className="flex h-full w-full items-center justify-center rounded-[3.5px] bg-[#0A090D]"
                style={{ boxShadow: "0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset" }}
            />
        </div>
    );
}

function SpeakerGrid() {
    return (
        <div
            className="mt-2 flex h-40 gap-[2px] px-[0.5px]"
            style={{
                backgroundImage: "radial-gradient(circle, #08080A 0.5px, transparent 0.5px)",
                backgroundSize: "3px 3px",
            }}
        />
    );
}
