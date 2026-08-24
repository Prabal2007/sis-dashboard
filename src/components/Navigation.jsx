"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, Heart, PhoneCall, QrCode } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Study Lounge", href: "/study-lounge", icon: Stethoscope },
  { label: "Memories", href: "/vault", icon: Heart },
  { label: "Hotline", href: "/hotline", icon: PhoneCall },
  { label: "Gift Tag", href: "/gift-qr", icon: QrCode },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 max-w-[95vw] sm:max-w-fit no-print">
      {/* Soft glassmorphic cream navigation pill container */}
      <div className="flex items-center gap-1 sm:gap-2 px-3 py-2.5 rounded-full backdrop-blur-md bg-white/80 border border-[#F0EDE6] shadow-[0_10px_35px_rgba(92,85,82,0.06)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-colors duration-300 flex items-center gap-1.5 focus-visible:outline-none"
            >
              {/* Soft Rose-Gold background indicator */}
              {isActive && (
                <motion.span
                  layoutId="active-navigation-pill"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="absolute inset-0 bg-rose-50 rounded-full border border-rose-200/50"
                />
              )}
              
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                isActive 
                  ? "text-[var(--color-accent)] scale-110" 
                  : "text-slate-400 hover:text-slate-650"
              }`} />
              
              <span className={`hidden md:inline transition-colors ${
                isActive 
                  ? "text-[var(--text-title)] font-extrabold" 
                  : "text-slate-500 hover:text-slate-700"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
