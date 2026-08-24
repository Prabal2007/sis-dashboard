import "./globals.css";
import Navigation from "../components/Navigation";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Dr. Didi's Desk • Rakhi Edition",
  description:
    "A personalized, heartwarming, and comforting sibling care dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-300">
        {/* Soft Warm-Cream Decorative Ambient Background Orbs */}
        <div className="absolute top-[2%] right-[5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-rose-200/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[5%] left-[2%] w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none" />

        {/* Global Dashboard Frame - Fully expanded */}
        <div className="w-full min-h-screen flex flex-col pb-28 md:pb-32">
          {/* Header Area (Attention grabbing, bold, yet warm) */}
          <header className="w-full border-b border-[var(--border-color)] bg-white/50 backdrop-blur-md sticky top-0 z-40 no-print px-6 sm:px-12 py-5 sm:py-6">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 rounded-2xl text-[var(--color-accent)] border border-rose-100">
                  <span className="text-xl">🩺</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-title)]">
                    Dr. Didi&apos;s Desk{" "}
                    <span className="text-[var(--color-accent)] font-semibold text-sm">
                      | Rakhi Edition
                    </span>
                  </h1>
                  <p className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                    Lucknow ⇄ Mathura • Sibling Care Protocol
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="bg-rose-50 border border-[var(--color-accent-light)]/40 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping" />
                <span className="text-[10.5px] font-bold text-[var(--color-accent)] font-mono uppercase tracking-wider">
                  Sync Mode: Remote Care Active
                </span>
              </div>
            </div>
          </header>

          {/* Expansive Main Content Area */}
          <main className="w-full px-6 sm:px-12 md:px-16 pt-8 flex-1">
            {children}
          </main>

          {/* Premium Warm Cream Footer */}
          <footer className="w-full mt-16 no-print border-t border-[#F0EDE6] bg-white/70 backdrop-blur-md px-6 sm:px-12 md:px-16 py-10 text-[var(--text-main)]">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#F0EDE6] pb-8">
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--color-accent)] font-bold text-xs uppercase tracking-wider">
                  <Heart className="w-4 h-4 fill-current animate-pulse" />
                  <span>Lucknow ⇄ Mathura Support Connection</span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-[var(--text-title)]">
                  Dr. Didi&apos;s Command Center
                </h4>
                <p className="text-xs sm:text-sm text-slate-455 leading-relaxed font-semibold max-w-xl">
                  A static static web application custom-designed to bring brotherly care, stress relievers, and sound mixes to her Krishna Mohan Medical hostel chambers.
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2 text-right">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-secondary)] bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-inner">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Rakhi Edition • Live & Active
                </span>
                <span className="text-[10px] text-slate-450 font-mono">
                  Updated August 2026
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-xs sm:text-sm text-slate-455 font-semibold">
              <p>
                Built with loads of ❤️ by your in-house B.Tech support engineer.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest">
                <span className="text-[var(--color-accent)]">Harshu</span>
                <span className="text-slate-350">•</span>
                <span className="text-[var(--color-accent)]">Krishu</span>
              </div>
            </div>
          </footer>
        </div>

        {/* Shared Bottom Navigation Pill */}
        <Navigation />
      </body>
    </html>
  );
}
