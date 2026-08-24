"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Gift,
  Heart,
  Coffee,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Stethoscope,
  Utensils,
  X,
  Feather
} from "lucide-react";
import { CONFIG } from "../config";

const SIBLING_LETTERS = [
  {
    id: "raksha-bandhan",
    tag: "Master Letter",
    icon: Heart,
    emoji: "❤️",
    accent: "from-rose-500 to-pink-500",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    title: "Open on Raksha Bandhan",
    subtitle: "A brotherly survival kit & eternal support",
    context: "Giving with pure intention and love matters far more than expensive, material gifts.",
    salutation: "Dear Dii,",
    body: [
      "Happy Raksha Bandhan!",
      "Since I'm still a B.Tech student without a salary, I couldn't buy you fancy gifts. But I wanted to make something exclusively for you that actually helps during your crazy MBBS journey.",
      "Inside this box is your official survival kit, emergency sister coupons, handwritten notes for tough days, and a custom web terminal I built just for you.",
      "Watching you handle endless postings, brutal exams, and massive textbooks makes me insanely proud. No matter how busy college gets, your in-house tech support and brothers are always in your corner.",
      "Forgive me for past behaviours and as well as for my future behaviour. It may look rude, but please understand me that it will definitely be for some good. I hope you will understand this: that what I have become is not my choice, it is time which has turned me into this (such a person).",
      "Have a great day, eat some sweets, and also share some with my other sisters who are taking care of you."
    ],
    verse: {
      sanskrit: "पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति |\nतदहं भक्त्युपहृतमश्नामि प्रयतात्मन: ||",
      reference: "Bhagavad Gita 9.26",
      translation: "If one offers Me with love and devotion a leaf, a flower, a fruit, or even water, I will accept it."
    },
    closing: "— Your Brothers (Harshu & Krishu)"
  },
  {
    id: "viva-terrible",
    tag: "Viva Emergency",
    icon: Stethoscope,
    emoji: "🩺",
    accent: "from-amber-500 to-orange-500",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Open when a viva goes terrible",
    subtitle: "Leave the department drama behind",
    context: "External criticism or a tough examiner does not define your intrinsic worth or intelligence.",
    salutation: "Hey, take a deep breath.",
    body: [
      "Viva examiners seem to have a PhD in making students feel like they know nothing, but remember: one bad viva does not define your intelligence or the doctor you are becoming.",
      "Real medicine isn't about answering trick questions in 3 seconds; it's about care, patience, and diagnostic problem solving.",
      "Brush it off, go grab a cup of coffee, and leave that examiner's mood behind in the department. You've bounced back from harder things than this. Remember your past times of class 10th, 12th, and NEET prep."
    ],
    verse: {
      sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन |\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ||",
      reference: "Bhagavad Gita 2.47",
      translation: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of results, nor yield to inaction."
    },
    note: "Krishna is the Supreme Personality of Godhead—when He has said it, then we should understand, agree, and follow. (Sorry if you didn't like it 🙃)",
    closing: "— Your In-House Tech Support & Brother"
  },
  {
    id: "postings-drained",
    tag: "Post-Duty Exhaustion",
    icon: Coffee,
    emoji: "☕",
    accent: "from-teal-500 to-emerald-500",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    title: "Open when clinical postings leave you completely drained",
    subtitle: "For the endless corridors and heavy ward rounds",
    context: "Strength during exhausting duty hours comes from dedicating oneself fully to selfless service without getting overwhelmed by immediate outcomes.",
    salutation: "Dear Didi,",
    body: [
      "If you're reading this, your feet and body must be hurting, you've stood through endless ward rounds, and your social battery is at 0%.",
      "Take off your shoes, drink a tall glass of water, and lie down for at least 20 minutes without touching a single book or phone/iPad screen. What you are doing and going through is physically and mentally grueling, and it's okay to feel completely spent.",
      "Always remember the day you took up this gigantic task of becoming a doctor: you didn't know then that it would take this much amount of hard work. But when you realized it as you grew up, your will still overcame the thought to give up. And this is what we (your brothers), our parents, and grandparents are proud of.",
      "Rest up today. The hospital will still be there tomorrow, but your health comes first. So, take care of yourself."
    ],
    verse: {
      sanskrit: "नात्यश्नतस्तु योगोऽस्ति न चैकान्तमनश्नत: |\nन चाति स्वप्नशीलस्य जाग्रतो नैव चार्जुन ||\nयुक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु |\nयुक्तस्वप्नावबोधस्य योगो भवति दु:खहा ||",
      reference: "Bhagavad Gita 6.16–17",
      translation: "Yoga is not possible for one who eats too much or eats too little, nor for one who sleeps too much or stays awake too long. For one who is disciplined in rest, work, and nourishment, peace follows naturally."
    },
    closing: "— Your Brothers"
  },
  {
    id: "miss-home",
    tag: "Homesick & Hungry",
    icon: Utensils,
    emoji: "🍱",
    accent: "from-orange-500 to-red-500",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    title: "Open when you miss home & home-cooked food",
    subtitle: "Bridging Lucknow and Mathura",
    context: "Distance between cities cannot weaken the bond of family and home; love and connection remain ever-present across any distance.",
    salutation: "Dear Motuji,",
    body: [
      "Sorry for calling you by this name—now you are no longer qualified to be called by this name (laughing 😜).",
      "Missing home? Hostel mess food finally pushed you over the edge, didn't it?",
      "Remember that holidays and semester breaks will roll around faster than you think. When you come home next, your favorite dishes will be waiting, and you won't have to request me to spend time with you (for at least 2–3 days).",
      "I'll definitely try to assist you in eating / finishing the food, not in cooking.",
      "Call Mom, Dad (Maa, Paa) or me/Bhai whenever you have some time in-between postings. We're only a phone call away."
    ],
    verse: {
      sanskrit: "यो मां पश्यति सर्वत्र सर्वं च मयि पश्यति |\nतस्याहं न प्रणश्यामि स च मे न प्रणस्यति ||",
      reference: "Bhagavad Gita 6.30",
      translation: "For those who carry love and shared bonds in their heart, connection remains unbroken regardless of physical distance."
    },
    closing: "— Lucknow ⇄ Mathura Express Bhai"
  },
  {
    id: "doubt-medicine",
    tag: "Purpose & Strength",
    icon: Sparkles,
    emoji: "✨",
    accent: "from-purple-500 to-indigo-500",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Open when you doubt why you chose medicine",
    subtitle: "Remember the spark that started it all",
    context: "Remembering the higher purpose of medicine—healing and serving humanity—when academic burnout blurs the vision.",
    salutation: "Dear Fighter,",
    body: [
      "Stop for a second and look back at where you started. You cleared brutal entrance exams and earned a seat in MBBS college. You have overcome so many difficulties in the past and you will even in the future.",
      "The syllabus is overwhelming, the sleep deprivation is real, and the road is long—but you chose this because you genuinely wanted to make an impact and heal people.",
      "The rough phases are temporary; the title of Doctor before your name will stay forever. On which everyone will praise and respect, that's what you and we wanted.",
      "You've got this. Keep going."
    ],
    verse: {
      sanskrit: "लभन्ते ब्रह्मनिर्वाणमृषय: क्षीणकल्मषा: |\nछिन्नद्वैधा यतात्मान: सर्वभूतहिते रता: ||",
      reference: "Bhagavad Gita 5.25",
      translation: "Those whose doubts are dispelled, whose minds are calm, and who are dedicated to the welfare of all beings attain the highest inner peace."
    },
    closing: "— Always in your corner, Your Brother"
  }
];

export default function HomeDashboard() {
  const [shagunClaimed, setShagunClaimed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    // Check if reset query parameter is present in the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("reset_shagun") === "true") {
      localStorage.removeItem("sis_shagun_claimed");
      // Clean up query parameters from browser address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const claimed = localStorage.getItem("sis_shagun_claimed") === "true";
    setShagunClaimed(claimed);
  }, []);

  // Synthesize letter open chime (Web Audio API)
  const playOpenChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      const now = audioCtxRef.current.currentTime;
      
      const sweep = [
        { note: 659.25, time: 0 },   // E5
        { note: 880.00, time: 0.08 }  // A5
      ];

      sweep.forEach((item) => {
        const osc = audioCtxRef.current.createOscillator();
        const gainNode = audioCtxRef.current.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(item.note, now + item.time);

        gainNode.gain.setValueAtTime(0, now + item.time);
        gainNode.gain.linearRampToValueAtTime(0.08, now + item.time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + item.time + 0.3);

        osc.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);

        osc.start(now + item.time);
        osc.stop(now + item.time + 0.35);
      });
    } catch (e) {}
  };

  const handleOpenLetter = (letter) => {
    playOpenChime();
    
    // Confetti unseal burst
    confetti({
      particleCount: 70,
      spread: 45,
      origin: { y: 0.65 },
      colors: ["#E11D48", "#FDA4AF", "#FAF8F6", "#10B981"]
    });

    setActiveLetter(letter);
  };

  const triggerConfetti = () => {
    if (shagunClaimed) return;

    const end = Date.now() + 2 * 1000;
    const colors = ["#E11D48", "#FDA4AF", "#F0EDE6", "#10B981"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setShagunClaimed(true);
    localStorage.setItem("sis_shagun_claimed", "true");
    setIsModalOpen(true);

    const cleanPhone = CONFIG.brotherWhatsApp.replace(/\D/g, "");
    const message = `Hey Bhai! I have officially claimed my Rakhi Shagun on the dashboard! 🎁💸 Please send the ₹500 shagun money to my phone!`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="w-full flex flex-col gap-10 pb-16">
      
      {/* --- HERO PANEL (Expansive, bold, clean) --- */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white border border-[#F0EDE6] rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50/40 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-[var(--color-accent)] font-bold text-xs uppercase tracking-widest bg-rose-50 border border-rose-100 rounded-full px-3.5 py-1.5 w-fit">
            <span>🎁 Sibling Link Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-title)] tracking-tight leading-tight">
            Dr. Didi&apos;s Desk <br className="hidden sm:inline" />
            <span className="text-[var(--color-accent)] font-black">Rakhi Edition</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed font-semibold max-w-2xl">
            A comforting, warm-cream lifestyle dashboard designed specifically for your MBBS clinical routine in Mathura. 
            Use this space to run Pomodoro timers, play relaxing soundscapes, scratch Zomato coupons, and view childhood archives.
          </p>
        </div>

        {/* Claim Shagun Button Panel */}
        <div className="flex flex-col items-center bg-[#FAF8F6] border border-[#F0EDE6] p-6.5 rounded-[2rem] shadow-inner text-center shrink-0 w-full md:w-80">
          <div className="mb-4">
            <Gift className="w-12 h-12 text-[var(--color-accent)] animate-bounce" />
          </div>
          <h3 className="text-lg font-black text-[var(--text-title)] mb-1">Claim Sibling Shagun</h3>
          <p className="text-xs sm:text-sm text-slate-455 leading-relaxed mb-5 max-w-xs font-semibold">
            Standard protocol dictates you must receive a shagun from Bhai. Taps confetti.
          </p>
          <button
            onClick={triggerConfetti}
            disabled={shagunClaimed}
            className={`w-full py-4 px-6 text-sm font-bold rounded-2xl transition-all duration-300 transform active:scale-95 ${
              shagunClaimed 
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none" 
                : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-md hover:shadow-rose-500/10"
            }`}
          >
            {shagunClaimed ? "Shagun Claimed & Dispatched! 📱" : "Claim Rakhi Shagun 💸"}
          </button>
        </div>
      </motion.div>

      {/* --- SIBLING CARE CAPSULES (Wax Sealed Envelopes) --- */}
      <div>
        <h2 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase mb-4 sm:mb-5 block">
          ❤️ Sibling Care Capsules
        </h2>
        
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full"
        >
          {SIBLING_LETTERS.map((letter) => {
            return (
              <motion.div
                key={letter.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => handleOpenLetter(letter)}
                className="relative bg-white/95 backdrop-blur border border-rose-100 hover:border-rose-300 rounded-[2.2rem] p-6 shadow-sm hover:shadow-md hover:shadow-rose-100/50 cursor-pointer overflow-hidden flex flex-col justify-between items-center text-center group transition-all duration-300 min-h-[290px]"
              >
                {/* Visual Envelope Top Flap Simulation */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-rose-50/40 to-transparent group-hover:h-6 transition-all duration-300 pointer-events-none" />

                {/* Badge Category pill */}
                <span className={`text-[10.5px] font-mono font-bold px-3.5 py-1.5 rounded-full border ${letter.badgeColor} uppercase tracking-wide`}>
                  {letter.tag}
                </span>

                {/* Wax Seal Pulse stamp */}
                <div className="relative flex items-center justify-center my-3">
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-full bg-[#E11D48] hover:bg-[#F43F5E] flex items-center justify-center shadow-md relative"
                  >
                    <div className="absolute inset-0.5 rounded-full border border-rose-450 opacity-60" />
                    <div className="absolute inset-1.5 rounded-full border border-rose-400 opacity-40" />
                    <span className="text-white text-base select-none font-bold">
                      {letter.emoji}
                    </span>
                  </motion.div>
                </div>

                {/* Header text */}
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-black text-[var(--text-title)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
                    {letter.title}
                  </h3>
                  <p className="text-xs text-slate-455 leading-relaxed font-bold">
                    {letter.subtitle}
                  </p>
                </div>

                {/* Inline context peek for card hover */}
                <div className="text-[11.5px] text-stone-550 leading-relaxed italic line-clamp-2 mt-2.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  &ldquo;{letter.context}&rdquo;
                </div>

                {/* Footer seal marker */}
                <span className="text-[10px] font-mono font-black tracking-widest text-slate-350 uppercase mt-4 block">
                  Click to Unseal 💌
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* --- QUICK ACCESS HUD SECTIONS (Pinterest-style large layout) --- */}
      <div>
        <h2 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase mb-4 sm:mb-5 block">
          Lounge Control Matrices
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
          
          {/* Card 1: Study Lounge */}
          <Link href="/study-lounge" className="group">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white border border-[#F0EDE6] hover:border-[var(--color-accent-light)] rounded-[2.2rem] p-7 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between"
            >
              <div>
                <div className="p-4 bg-rose-50 text-[var(--color-accent)] rounded-2xl w-fit mb-5 border border-rose-100/40">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-title)] group-hover:text-[var(--color-accent)] transition-colors mb-2.5">
                  Study Lounge & Mixer
                </h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-semibold">
                  A high-yield dashboard featuring a Pomodoro rotation timer, ambient noise regulators, and custom MBBS study sticky notes.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Enter Lounge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </Link>

          {/* Card 2: Memory Vault */}
          <Link href="/vault" className="group">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white border border-[#F0EDE6] hover:border-[var(--color-accent-light)] rounded-[2.2rem] p-7 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between"
            >
              <div>
                <div className="p-4 bg-rose-50 text-[var(--color-accent)] rounded-2xl w-fit mb-5 border border-rose-100/40">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-title)] group-hover:text-[var(--color-accent)] transition-colors mb-2.5">
                  Memories Archive
                </h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-semibold">
                  Browse pre-loaded static snapshots, listen to offline chiptune melodies, and read sealed postcards from Lucknow.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Enter Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </Link>

          {/* Card 3: Bhaiya Hotline */}
          <Link href="/hotline" className="group">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white border border-[#F0EDE6] hover:border-[var(--color-accent-light)] rounded-[2.2rem] p-7 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between"
            >
              <div>
                <div className="p-4 bg-rose-50 text-[var(--color-accent)] rounded-2xl w-fit mb-5 border border-rose-100/40">
                  <Coffee className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-title)] group-hover:text-[var(--color-accent)] transition-colors mb-2.5">
                  Bhaiya Hotline presets
                </h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-semibold">
                  Quick WhatsApp treat requests and dynamic scratch voucher coupons with localized persistence.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Hotline Control</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </Link>

          {/* Card 4: Gift QR */}
          <Link href="/gift-qr" className="group">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white border border-[#F0EDE6] hover:border-[var(--color-accent-light)] rounded-[2.2rem] p-7 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between"
            >
              <div>
                <div className="p-4 bg-rose-50 text-[var(--color-accent)] rounded-2xl w-fit mb-5 border border-rose-100/40">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-title)] group-hover:text-[var(--color-accent)] transition-colors mb-2.5">
                  Gift Box QR Tag
                </h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-semibold">
                  A beautiful, printable gift coupon tag featuring the website QR target to print out and stick on the physical Rakhi gift box.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Voucher</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </Link>

        </div>
      </div>

      {/* --- PARCHMENT MODAL / DIGITAL LETTER REVEAL --- */}
      <AnimatePresence>
        {activeLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLetter(null)}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            />

            {/* Letter Parchment Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotateX: 10 }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="bg-[#FFFDF6] border-4 border-double border-[#D9C5B2] max-w-2xl w-full max-h-[85vh] p-6 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10 overflow-y-auto flex flex-col justify-between text-left"
            >
              
              {/* Torn/Stitched border overlay */}
              <div className="absolute inset-2 border border-[#EAD2AC] border-dashed rounded-[2rem] pointer-events-none" />

              {/* Lotus/Stethoscope water-mark background logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500 opacity-[0.03] pointer-events-none select-none">
                <Stethoscope className="w-64 h-64" />
              </div>

              <div>
                {/* Header controls */}
                <div className="flex justify-between items-center border-b border-[#F0EDE6] pb-4 mb-5 relative z-10">
                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${activeLetter.badgeColor} uppercase tracking-wide`}>
                    {activeLetter.tag}
                  </span>
                  
                  <button 
                    onClick={() => setActiveLetter(null)}
                    className="text-xs font-mono font-bold text-slate-400 hover:text-[var(--color-accent)] transition flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    <span>FOLD [ESC]</span>
                  </button>
                </div>

                {/* Envelope Context Box */}
                {activeLetter.context && (
                  <div className="bg-rose-50/30 border border-rose-100/50 rounded-2xl p-4.5 mb-5 text-xs sm:text-sm text-rose-900/90 leading-relaxed italic relative overflow-hidden z-10 font-medium">
                    <span className="font-bold uppercase tracking-wider text-[8.5px] block text-[var(--color-accent)] mb-1 font-mono">
                      Envelope Context
                    </span>
                    &ldquo;{activeLetter.context}&rdquo;
                  </div>
                )}

                {/* Letter Body Content */}
                <div className="space-y-4 relative z-10">
                  <p className="text-2xl sm:text-3xl text-[var(--color-accent)] font-bold handwriting leading-tight">
                    {activeLetter.salutation}
                  </p>

                  <div className="space-y-4 text-stone-700 font-serif leading-relaxed text-sm sm:text-base md:text-lg">
                    {activeLetter.body.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Gita Shloka Highlight Card */}
                  {activeLetter.verse && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border-l-4 border-amber-500 rounded-r-xl p-5 shadow-sm my-6 relative overflow-hidden">
                      <div className="absolute top-2 right-3 text-amber-500/10 font-bold text-3xl font-mono select-none">ॐ</div>
                      
                      {/* Sanskrit verse */}
                      <span className="block text-center font-semibold text-amber-955 leading-relaxed text-xs sm:text-sm md:text-base whitespace-pre-line tracking-wide">
                        {activeLetter.verse.sanskrit}
                      </span>
                      
                      {/* English translation */}
                      <span className="block text-center text-xs sm:text-sm text-stone-600 italic mt-3 leading-relaxed">
                        &ldquo;{activeLetter.verse.translation}&rdquo;
                      </span>

                      {/* Chapter citation badge */}
                      <div className="flex justify-end mt-2">
                        <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100/50 px-2 py-0.5 rounded border border-amber-255/20">
                          {activeLetter.verse.reference}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Optional Note (Viva emergency text clarification) */}
                  {activeLetter.note && (
                    <p className="text-xs sm:text-sm text-slate-500 italic leading-normal bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      💡 Note: {activeLetter.note}
                    </p>
                  )}

                  {/* Signature Sign-off */}
                  <div className="pt-6 border-t border-[#F0EDE6] mt-6 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Warmly signed by,</span>
                      <span className="text-3xl sm:text-4xl text-[var(--color-accent)] mt-1.5 font-bold leading-tight block rotate-[-1deg] handwriting">
                        {activeLetter.closing}
                      </span>
                    </div>
                    
                    <div className="text-amber-700 opacity-60">
                      <Feather className="w-8 h-8 rotate-45" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Sticky close action pill button */}
              <div className="mt-8 relative z-10 flex justify-center">
                <button
                  onClick={() => setActiveLetter(null)}
                  className="px-8 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs sm:text-sm font-extrabold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 flex items-center gap-2"
                >
                  <span>Fold Letter & Store</span>
                  <span>💌</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
