"use client";

import { useState, useEffect } from "react";
import { QrCode, Printer, Heart, Stethoscope, Scissors } from "lucide-react";
import { CONFIG } from "../../config";

export default function GiftQR() {
  const [deploymentUrl, setDeploymentUrl] = useState("https://sibling-care-dashboard.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDeploymentUrl(window.location.origin);
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(deploymentUrl)}&color=2E2522&bgcolor=FAF8F6`;

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10 pb-16">
      
      {/* Introduction Card */}
      <div className="bg-white border border-[#F0EDE6] p-7 sm:p-8 rounded-3xl shadow-sm no-print">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-title)] flex items-center gap-2">
          <QrCode className="w-6 h-6 text-[var(--color-accent)]" />
          Gift Box QR Tag Generator
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-main)] font-semibold opacity-75 mt-1.5 leading-relaxed">
          Generate an aesthetic QR code tag pointing to this deployed Care Dashboard. 
          Print this page, cut along the dotted line, and attach the tag to the physical Rakhi gift box in Mathura. 
          When scanned with a phone camera, it loads the dashboard instantly.
        </p>

        {/* Input targets */}
        <div className="mt-6 max-w-xl">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
            Target URL (Dynamic Autodetect)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={deploymentUrl}
              onChange={(e) => setDeploymentUrl(e.target.value)}
              placeholder="https://your-deployed-site.com"
              className="flex-1 bg-[#FAF8F6] border border-[#F0EDE6] rounded-2xl px-4 py-3.5 text-xs text-[var(--text-title)] focus:outline-none focus:border-[var(--color-accent)] transition shadow-inner"
            />
            <button
              onClick={handlePrint}
              className="px-6 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-2xl text-xs font-bold transition shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 hover:shadow-rose-500/10"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tag</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- PRINTABLE ASSEMBLY VIEW --- */}
      <div className="flex justify-center items-center py-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] no-print">
        
        {/* Physical cut guide frame */}
        <div className="w-[330px] bg-[#FAF8F6] text-[#2E2522] border-4 border-dashed border-[#E11D48] p-7 rounded-[2.2rem] shadow-xl relative flex flex-col justify-between items-center text-center font-sans overflow-hidden">
          
          {/* Hole punch mark */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#E11D48] bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
            <span className="text-[5.5px] font-mono text-[#E11D48] tracking-widest uppercase">PUNCH HERE</span>
          </div>

          {/* Ribbon Header decoration */}
          <div className="w-full flex justify-between items-center mt-6 mb-4 border-b border-[#E11D48]/15 pb-3">
            <div className="flex items-center gap-1 text-[#E11D48]">
              <Stethoscope className="w-4 h-4 animate-pulse" />
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase">MBBS ASSIST</span>
            </div>
            <div className="flex items-center gap-1 text-[#10B981]">
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase">B.TECH SECURE</span>
            </div>
          </div>

          {/* Address slip */}
          <div className="w-full text-left space-y-2 mb-4 bg-white/70 p-4 rounded-2xl border border-rose-100/50 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] font-mono text-slate-400 uppercase w-10">TO:</span>
              <span className="text-xs font-black text-[#2E2522]">Dr. {CONFIG.sisterName} 🩺</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] font-mono text-slate-400 uppercase w-10">FROM:</span>
              <span className="text-xs font-black text-[#2E2522]">{CONFIG.brotherName} 💻</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[8.5px] font-mono text-slate-400 uppercase w-10 mt-0.5">SYNC:</span>
              <span className="text-[8.5px] font-mono text-slate-500 font-bold leading-tight break-all">
                Lucknow ⇄ Mathura
              </span>
            </div>
          </div>

          {/* Clean QR code frame */}
          <div className="bg-white p-4 rounded-2xl border border-[#F0EDE6] shadow-sm my-2">
            <img
              src={qrImageUrl}
              alt="Gift Scan target QR"
              className="w-40 h-40 mx-auto bg-white rounded"
            />
          </div>

          {/* Bottom tag footnotes */}
          <div className="mt-4 space-y-1">
            <p className="text-[9px] font-mono font-bold text-[#E11D48] tracking-widest uppercase flex items-center justify-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-[#E11D48]" /> SCAN TO UNLOCK CORE COMMAND
            </p>
            <p className="text-[8px] text-slate-500 leading-relaxed max-w-[240px] mx-auto font-medium">
              A private caretaking dashboard dispatched in Lucknow for Mathura medical deployments.
            </p>
          </div>

          <div className="absolute bottom-2 right-2 text-slate-350 pointer-events-none">
            <Scissors className="w-4 h-4 rotate-90" />
          </div>

        </div>

      </div>

      {/* --- HIDDEN FOR SCREEN VIEW, VISIBLE ONLY FOR PRINT DIALOGS --- */}
      <div className="hidden print-only">
        <div className="mx-auto w-[3.5in] h-[5.2in] bg-[#FAF8F6] text-[#2E2522] border-4 border-dashed border-[#E11D48] p-8 rounded-[2.2rem] flex flex-col justify-between items-center text-center font-sans relative">
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#E11D48] bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
            <span className="text-[6px] font-mono text-[#E11D48] tracking-widest uppercase">PUNCH HOLE</span>
          </div>

          <div className="w-full flex justify-between items-center mt-6 mb-4 border-b border-[#E11D48]/20 pb-3">
            <div className="flex items-center gap-1 text-[#E11D48]">
              <Stethoscope className="w-4 h-4" />
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase">MBBS ASSIST</span>
            </div>
            <div className="flex items-center gap-1 text-[#10B981]">
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase">B.TECH SECURE</span>
            </div>
          </div>

          <div className="w-full text-left space-y-2 mb-4 bg-white/80 p-4 rounded-2xl border border-rose-100 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] font-mono text-slate-400 uppercase w-10">TO:</span>
              <span className="text-xs font-black text-[#2E2522]">Dr. {CONFIG.sisterName} 🩺</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] font-mono text-slate-400 uppercase w-10">FROM:</span>
              <span className="text-xs font-black text-[#2E2522]">{CONFIG.brotherName} 💻</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[8.5px] font-mono text-slate-400 uppercase w-10 mt-0.5">SYNC:</span>
              <span className="text-[8.5px] font-mono text-slate-500 font-bold leading-tight break-all">
                Lucknow ⇄ Mathura
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#F0EDE6] shadow-md my-2">
            <img
              src={qrImageUrl}
              alt="Gift Scan target QR"
              className="w-44 h-44 mx-auto bg-white rounded"
            />
          </div>

          <div className="mt-4">
            <p className="text-[8.5px] font-mono font-bold text-[#E11D48] tracking-widest uppercase flex items-center justify-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 fill-[#E11D48]" /> SCAN TO UNLOCK DASHBOARD
            </p>
            <p className="text-[8px] text-slate-500 max-w-[230px] mx-auto leading-relaxed font-semibold">
              Built with ❤️ by your in-house B.Tech support engineer. Lucknow ⇄ Mathura Care Protocol.
            </p>
          </div>

          <div className="absolute bottom-3 right-3 text-slate-350">
            <Scissors className="w-4.5 h-4.5 rotate-90" />
          </div>

        </div>
      </div>

    </div>
  );
}
