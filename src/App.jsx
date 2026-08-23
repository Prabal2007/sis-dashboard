import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HeartPulse,
  Coffee,
  CheckCircle2,
  Circle,
  Stethoscope,
  Terminal,
  Volume2,
  VolumeX,
  Trash2,
  QrCode,
  Image as ImageIcon,
  AlertTriangle,
  FolderOpen,
  Sun,
  Moon,
  Home,
  MessageSquare,
  Send,
  ExternalLink,
  Check
} from "lucide-react";
import { CONFIG } from "./config";

// --- Fun MBBS Study Flashcards Deck with Sibling Humor ---
const FLASHCARDS = [
  {
    id: 1,
    front: "🩺 Cranial Nerves Mnemonic?",
    back: "On Old Olympus' Towering Tops A Finn And German Viewed Some Hops. (And remember: your brother Prabal is always viewing tech support! 🖥️)"
  },
  {
    id: 2,
    front: "🦴 Carpal Bones Mnemonic?",
    back: "She Looks Too Pretty, Try To Catch Her. (Scaphoid, Lunate, Triquetrum, Pisiform, Hamate, Capitate, Trapezoid, Trapezium. Check your desk posture, Didi! 🪑)"
  },
  {
    id: 3,
    front: "🧠 Circle of Willis Mnemonic?",
    back: "Posterior Cerebral, Posterior Communicating, Internal Carotid, Anterior Cerebral, Anterior Communicating. (Almost as complex as debugging code! 💻)"
  },
  {
    id: 4,
    front: "💊 TB Drugs Mnemonic?",
    back: "PRISE: Pyrazinamide, Rifampicin, Isoniazid, Streptomycin, Ethambutol. (Almost as essential as tea breaks! ☕)"
  },
  {
    id: 5,
    front: "🍕 Study Snack Mnemonic?",
    back: "No mnemonic here! Just head to the Support Desk and click 'Sponsor Treat' to WhatsApp Prabal for Zomato snack delivery! 🍩"
  }
];

// --- Fun Quotes Pool (Doctor/Engineer themed) ---
const QUOTES = [
  {
    text: "Remember: Mitochondria is the powerhouse of the cell, and caffeine is the powerhouse of Dr. Didi.",
    tag: "Biochem Fact",
  },
  {
    text: "One bad viva does not define your clinical brilliance. You're going to save real lives, not impress viva examiners forever.",
    tag: "Perspective",
  },
  {
    text: "Your B.Tech brother officially guarantees that no compiler error or medical syllabus can break your spirit.",
    tag: "Tech Support",
  },
  {
    text: "Drink water, fix your posture, and stop diagnosing yourself with rare autoimmune conditions from Robbins.",
    tag: "Health Check",
  },
  {
    text: "Future Surgeon / MD in progress. Take a deep breath — you've got this round covered.",
    tag: "Motivation",
  },
  {
    text: "Need food or a tech fix? Brotherly on-call emergency services are active 24/7.",
    tag: "Emergency Ops",
  },
  {
    text: "Unlike a C++ program, you can't debug human biology at 3 AM. Go to sleep, Doctor!",
    tag: "Pro Tip",
  },
  {
    text: "If you feel overwhelmed, just think: at least you don't have to explain to a computer why a semicolon broke your entire day.",
    tag: "Dev Insight",
  },
  {
    text: "Harrison's Principles of Internal Medicine is thick enough to be a physical shield against bad vibes.",
    tag: "Physic Force",
  },
  {
    text: "Your stethoscope hears your heartbeat, but your brother hears your stress from miles away. Take a 10m break!",
    tag: "Heart Check",
  }
];

export default function SiblingStudyDashboard() {
  // --- Global Theme (Light by default, customizable cream look) ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("sis_dashboard_theme") || "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("sis_dashboard_theme", theme);
  }, [theme]);

  // --- Navigation Tab Selection ---
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'focus' | 'memories' | 'support'

  // --- Config parameters ---
  const sisterName = CONFIG.sisterName;
  const brotherWhatsApp = CONFIG.brotherWhatsApp;
  const gdriveLink = CONFIG.driveAlbumUrl;
  const locations = CONFIG.locations;

  // --- Flashcard Deck State ---
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- Timer States (50m Study / 10m Break) ---
  const [mode, setMode] = useState("study"); 
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // --- Audio State ---
  const [activeAudio, setActiveAudio] = useState("silent"); 
  const [volume, setVolume] = useState(0.5);
  const [audioError, setAudioError] = useState("");
  
  // HTML5 audio elements refs
  const lofiAudioRef = useRef(null);
  const rainAudioRef = useRef(null);
  
  // Web Audio API refs for synthesized medical ambient sound
  const audioCtxRef = useRef(null);
  const humOscRef = useRef(null);
  const humGainRef = useRef(null);
  const beepIntervalRef = useRef(null);

  // --- Quote State & Terminal Decrypting Animation ---
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState(QUOTES[0].text);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // --- Checklist State ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("sis_dashboard_tasks");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Finish Pharmacology / Pathology high-yield notes", done: false },
      { id: 2, text: "Update clinical posting logbook entry", done: false },
      { id: 3, text: "Hydrate & take a 10-minute stretch", done: true },
    ];
  });
  const [newTask, setNewTask] = useState("");

  // --- Sibling Support Desk Tickets Log ---
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem("sis_dashboard_tickets");
    return saved ? JSON.parse(saved) : [
      { id: 1, type: "Treat Sponsor", desc: "Sponsoring a Zomato delivery to Mathura.", status: "PENDING" },
      { id: 2, type: "Remote Tech Session", desc: "Remote screen-share debug session setup.", status: "RESOLVED" }
    ];
  });
  const [ticketDesc, setTicketDesc] = useState("");

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("sis_dashboard_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_tickets", JSON.stringify(tickets));
  }, [tickets]);

  // Countdown timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // --- Audio Controls ---
  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (lofiAudioRef.current) lofiAudioRef.current.volume = v;
    if (rainAudioRef.current) rainAudioRef.current.volume = v;
    if (humGainRef.current) {
      humGainRef.current.gain.setValueAtTime(v * 0.03, audioCtxRef.current.currentTime);
    }
  };

  const startHospitalSynth = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      
      // Low Hum
      humOscRef.current = audioCtxRef.current.createOscillator();
      humGainRef.current = audioCtxRef.current.createGain();
      
      humOscRef.current.type = "sine";
      humOscRef.current.frequency.setValueAtTime(60, audioCtxRef.current.currentTime);
      humGainRef.current.gain.setValueAtTime(volume * 0.03, audioCtxRef.current.currentTime);
      
      const filter = audioCtxRef.current.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, audioCtxRef.current.currentTime);
      
      humOscRef.current.connect(filter);
      filter.connect(humGainRef.current);
      humGainRef.current.connect(audioCtxRef.current.destination);
      humOscRef.current.start();

      // ECG Heart monitor beep at 60 BPM
      beepIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
        
        const beepOsc = audioCtxRef.current.createOscillator();
        const beepGain = audioCtxRef.current.createGain();
        
        beepOsc.type = "sine";
        beepOsc.frequency.setValueAtTime(920, audioCtxRef.current.currentTime);
        
        beepGain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        beepGain.gain.linearRampToValueAtTime(volume * 0.02, audioCtxRef.current.currentTime + 0.02);
        beepGain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.12);
        
        beepOsc.connect(beepGain);
        beepGain.connect(audioCtxRef.current.destination);
        beepOsc.start();
        beepOsc.stop(audioCtxRef.current.currentTime + 0.15);
      }, 1000);
    } catch (e) {
      console.error(e);
      setAudioError("Web Audio synthesis is blocked or unsupported on this device.");
    }
  };

  const stopHospitalSynth = () => {
    if (humOscRef.current) {
      try {
        humOscRef.current.stop();
      } catch {
        // Already stopped
      }
      humOscRef.current = null;
    }
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
  };

  const selectAudio = (track) => {
    setAudioError("");
    if (lofiAudioRef.current) lofiAudioRef.current.pause();
    if (rainAudioRef.current) rainAudioRef.current.pause();
    stopHospitalSynth();

    setActiveAudio(track);

    if (track === "lofi" && lofiAudioRef.current) {
      lofiAudioRef.current.volume = volume;
      lofiAudioRef.current.play().catch(() => {
        setAudioError("Auto-play blocked. Interact with the page to play audio.");
      });
    } else if (track === "rain" && rainAudioRef.current) {
      rainAudioRef.current.volume = volume;
      rainAudioRef.current.play().catch(() => {
        setAudioError("Auto-play blocked. Interact with the page to play audio.");
      });
    } else if (track === "hospital") {
      startHospitalSynth();
    }
  };

  // --- Quote Decryption Glitch Animation ---
  const triggerQuoteChange = (index) => {
    if (isDecrypting) return;
    setIsDecrypting(true);
    const targetQuote = QUOTES[index].text;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]";
    let iterations = 0;
    
    const interval = setInterval(() => {
      const currentDecrypted = targetQuote
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < iterations) return targetQuote[i];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setDisplayText(currentDecrypted);
      
      iterations += 2;
      if (iterations >= targetQuote.length + 5) {
        clearInterval(interval);
        setDisplayText(targetQuote);
        setCurrentQuoteIndex(index);
        setIsDecrypting(false);
      }
    }, 25);
  };

  const getNewQuote = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * QUOTES.length);
    } while (nextIndex === currentQuoteIndex && QUOTES.length > 1);
    triggerQuoteChange(nextIndex);
  };

  // --- Timer Actions ---
  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === "study" ? 50 * 60 : 10 * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "study" ? 50 * 60 : 10 * 60);
  };

  const progressPercentage = (timeLeft / (mode === "study" ? 50 * 60 : 10 * 60)) * 100;
  const strokeDashoffset = 364 - (364 * progressPercentage) / 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // --- Checklist ---
  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask("");
  };

  // --- Sibling WhatsApp Redirection Dispatcher ---
  const dispatchWhatsAppMessage = (type, customDesc = "") => {
    if (!brotherWhatsApp || brotherWhatsApp.includes("XXXX")) {
      alert("Note: Brother's WhatsApp number is still set to placeholder in src/config.js. Adjust it there to dispatch messages!");
      return;
    }
    
    const cleanNumber = brotherWhatsApp.replace(/\D/g, "");
    
    let text;
    if (type === "Treat Sponsor") {
      text = `Hey! Study session is going long and my energy levels are hitting rock bottom. Can you please sponsor a coffee or snack treat delivery to my Mathura hostel address? ☕🍰 Zomato/Swiggy is waiting!`;
    } else if (type === "Remote Tech Session") {
      text = `IT Emergency! My laptop/device is acting up and I can't study properly. Can we jump on a remote AnyDesk or Zoom screen-share debug session to fix it? 🖥️`;
    } else if (type === "Venting Call") {
      text = `Hey, clinical postings/viva prep is getting overwhelming. Do you have 5 minutes for a quick phone call to motivate me? 📞`;
    } else if (type === "Meme Request") {
      text = `I need a quick laugh to recharge my brain cells. Send me a funny meme or joke! 🎭`;
    } else {
      text = `Hey! I logged a manual support ticket on the dashboard: "${customDesc}"`;
    }

    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  // 1-Click WhatsApp Trigger from Support Desk
  const triggerQuickSupport = (type) => {
    const newT = { id: Date.now(), type, desc: `1-Click trigger: requesting ${type}`, status: "OPEN" };
    setTickets([newT, ...tickets]);
    dispatchWhatsAppMessage(type);
  };

  // Custom text WhatsApp Trigger
  const handleCustomTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketDesc.trim()) return;

    const newT = { id: Date.now(), type: "Custom Help Request", desc: ticketDesc.trim(), status: "OPEN" };
    setTickets([newT, ...tickets]);
    
    dispatchWhatsAppMessage("Custom Help Request", ticketDesc.trim());
    setTicketDesc("");
  };

  const advanceTicketStatus = (id) => {
    setTickets(tickets.map((t) => {
      if (t.id === id) {
        let nextStatus;
        if (t.status === "OPEN") nextStatus = "PENDING";
        else if (t.status === "PENDING") nextStatus = "IN PROGRESS";
        else if (t.status === "IN PROGRESS") nextStatus = "RESOLVED";
        else nextStatus = "OPEN";
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const deleteTicket = (id) => {
    setTickets(tickets.filter((t) => t.id !== id));
  };

  // Flashcards navigation
  const nextFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % FLASHCARDS.length);
    }, 150);
  };

  const prevFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length);
    }, 150);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center select-none selection:bg-rose-500/20 selection:text-rose-600 transition-colors duration-500 relative pb-16 px-4 sm:px-8 md:px-12">
      
      {/* Visual Floating Immersive Ambient Orbs */}
      <div className="absolute top-[5%] right-[10%] w-[550px] h-[550px] bg-rose-500/8 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-[15%] left-[5%] w-[650px] h-[650px] bg-cyan-500/8 dark:bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[35%] left-[45%] w-[450px] h-[450px] bg-purple-500/4 dark:bg-purple-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Hidden Loop Audios */}
      <audio ref={lofiAudioRef} src="https://www.chosic.com/wp-content/uploads/2021/04/Warm-Lights.mp3" loop preload="auto" />
      <audio ref={rainAudioRef} src="https://www.soundjay.com/nature/sounds/rain-07.mp3" loop preload="auto" />

      {/* --- TOP GLOBAL NAVIGATION HEADER --- */}
      <header className="w-full max-w-[1400px] mt-8 relative z-20">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-5 sm:p-6 sm:px-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[var(--card-shadow)] backdrop-blur-xl">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[var(--color-accent)] animate-pulse shadow-sm">
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-title)] flex items-center gap-3 justify-center lg:justify-start">
                Dr. {sisterName}'s Survival Terminal
                <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-full bg-rose-500/10 text-[var(--color-accent)] border border-rose-500/20 shadow-sm uppercase tracking-wide">
                  Curated Care
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-main)] font-medium opacity-85 mt-0.5">
                {locations.sister} ⇄ {locations.brother} Sibling Connection • Online 24/7
              </p>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav className="flex flex-wrap justify-center items-center bg-[var(--bg-primary)] p-1.5 rounded-3xl border border-[var(--border-color)] gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
                activeTab === "home"
                  ? "bg-[var(--bg-card)] text-[var(--text-title)] shadow-md"
                  : "text-[var(--text-main)] opacity-70 hover:opacity-100 hover:scale-105"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Hub</span>
            </button>
            <button
              onClick={() => setActiveTab("focus")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
                activeTab === "focus"
                  ? "bg-[var(--bg-card)] text-[var(--text-title)] shadow-md"
                  : "text-[var(--text-main)] opacity-70 hover:opacity-100 hover:scale-105"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Focus Room</span>
            </button>
            <button
              onClick={() => setActiveTab("memories")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
                activeTab === "memories"
                  ? "bg-[var(--bg-card)] text-[var(--text-title)] shadow-md"
                  : "text-[var(--text-main)] opacity-70 hover:opacity-100 hover:scale-105"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Memories Vault</span>
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
                activeTab === "support"
                  ? "bg-[var(--bg-card)] text-[var(--text-title)] shadow-md"
                  : "text-[var(--text-main)] opacity-70 hover:opacity-100 hover:scale-105"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Support Desk</span>
            </button>
          </nav>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title="Toggle Light/Dark Theme"
            className="p-3.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-title)] rounded-2xl shadow-inner transition duration-300 hover:scale-105 active:scale-95 shrink-0"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* --- CONTENT CONTAINER WITH TAB ROUTING --- */}
      <main className="w-full max-w-[1400px] mt-8 relative z-20 flex-1 flex flex-col">
        
        {/* --- TAB 1: WELCOME & SETUP HUB (REDESIGNED FOR MAXIMUM CLARITY) --- */}
        {activeTab === "home" && (
          <div className="fade-in-tab flex flex-col gap-8">
            
            {/* MAJESTIC INTRODUCTORY CARD: SPECIFYING WHAT, WHY, HOW, & WHY */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 sm:p-10 shadow-[var(--card-shadow)] backdrop-blur-md">
              <div className="max-w-4xl">
                <span className="text-xs font-mono tracking-widest text-[var(--color-accent)] font-bold uppercase block mb-2">
                  🚀 Quick-Start System Manual
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-title)] tracking-tight mb-4">
                  Welcome to Your Survival Terminal, Doctor! 🩺
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed mb-8">
                  This curated study terminal is designed specifically for your MBBS rotations. It is engineered to help you manage your focus, unwind with family memories, and instantly summon care packages or tech debugging support.
                </p>
              </div>

              {/* 4-Panel Overview Grid (What, Why, How, Why) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6.5 rounded-[1.8rem] hover:scale-[1.02] transition-transform duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold mb-4 text-sm">🎯</div>
                  <h4 className="text-sm font-black text-[var(--text-title)] mb-2 uppercase tracking-wide">1. What is this?</h4>
                  <p className="text-xs text-[var(--text-main)] leading-relaxed">
                    A customized browser utility that acts as an interactive study rotation workstation and a direct, secure care bridge to your brother's Lucknow desk.
                  </p>
                </div>

                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6.5 rounded-[1.8rem] hover:scale-[1.02] transition-transform duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold mb-4 text-sm">❤️</div>
                  <h4 className="text-sm font-black text-[var(--text-title)] mb-2 uppercase tracking-wide">2. Why was it made?</h4>
                  <p className="text-xs text-[var(--text-main)] leading-relaxed">
                    MBBS rotas are stressful. Since you study in Mathura and I work in Lucknow, this dashboard ensures that remote tech debugging or treat deliveries are just one click away.
                  </p>
                </div>

                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6.5 rounded-[1.8rem] hover:scale-[1.02] transition-transform duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold mb-4 text-sm">⚡</div>
                  <h4 className="text-sm font-black text-[var(--text-title)] mb-2 uppercase tracking-wide">3. How to use?</h4>
                  <p className="text-xs text-[var(--text-main)] leading-relaxed">
                    Tap <strong>Focus Room</strong> for the Pomodoro clock and soundscapes. Go to <strong>Support Desk</strong> to trigger 1-click pre-formatted WhatsApp care packages to Prabal.
                  </p>
                </div>

                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6.5 rounded-[1.8rem] hover:scale-[1.02] transition-transform duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold mb-4 text-sm">🔒</div>
                  <h4 className="text-sm font-black text-[var(--text-title)] mb-2 uppercase tracking-wide">4. Why to use?</h4>
                  <p className="text-xs text-[var(--text-main)] leading-relaxed">
                    It hosts zero third-party databases (100% private), runs without heavy setups, gives your eyes a breaks with dual themes, and ensures your brother handles the logistics!
                  </p>
                </div>

              </div>
            </div>

            {/* Split layout: Intro card & Vitals Desk */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Intro Welcome Card (Widescreen 7-cols) */}
              <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 sm:p-12 shadow-[var(--card-shadow)] flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <span className="text-xs font-mono tracking-widest text-[var(--color-accent)] font-bold uppercase block mb-4">
                    ✉️ Personal Care Package Note
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-title)] tracking-tight mb-6">
                    A Note From Lucknow
                  </h2>
                  <div className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed space-y-5 font-sans opacity-95">
                    <p className="font-extrabold text-rose-500 dark:text-rose-400 text-lg">Dear Didi,</p>
                    <p>
                      I know clinical postings are grueling and the vivas are exhausting. Living in hostel rooms away from home makes studying twice as hard. 
                      Since you are in <strong>{locations.sister}</strong> and I am in <strong>{locations.brother}</strong>, I wanted to build you a digital hub.
                    </p>
                    <p>
                      Consider this your personal <strong>brotherly assistance portal</strong>. Use it to time your MBBS study sessions, play ambient soundscapes to mask noisy hostel walls, scroll through old memories, or signal when you need snacks.
                    </p>
                    <div className="signature-font text-4xl text-rose-500 dark:text-rose-400 mt-8 rotate-[-1.5deg] leading-tight pt-2">
                      Happy studying! B.Tech support is always on call.<br />
                      — Your Brother {CONFIG.brotherName} ❤️
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4 border-t border-[var(--border-color)] pt-8">
                  <button
                    onClick={() => setActiveTab("focus")}
                    className="flex-1 py-4 px-8 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white rounded-2xl text-sm font-bold shadow-xl shadow-rose-500/10 transition duration-300 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Launch Study Rotation Tools</span>
                    <Terminal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Redesigned Telemetry & Large Flipping Flashcards Card (lg:col-span-5) */}
              <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-[var(--card-shadow)] flex flex-col justify-start backdrop-blur-md">
                
                {/* Header segment */}
                <div className="border-b border-[var(--border-color)] pb-4 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[var(--color-secondary)] font-extrabold uppercase bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20 shadow-sm flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                      Live Connection
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-[var(--color-accent)] font-extrabold uppercase bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 shadow-sm">
                      Rakhi 2026
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-title)]">
                    Link Telemetry Desk
                  </h3>
                </div>

                {/* Telemetry Stats Board */}
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-3 shadow-inner mb-6">
                  <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase font-bold">Telemetry Connection Logs</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">Location Link</span>
                      <span className="font-bold text-[var(--text-title)]">{locations.sister} ⇄ {locations.brother}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Channel Latency</span>
                      <span className="font-mono font-bold text-[var(--text-title)]">24ms (SSL SECURED)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Distance Metric</span>
                      <span className="font-mono font-bold text-[var(--text-title)]">~380 KM (On-Call)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Service Status</span>
                      <span className="text-emerald-500 font-mono font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 fill-current" /> ONLINE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enlarged 3D Flipping Flashcards */}
                <div className="flex-1 flex flex-col justify-start">
                  <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase font-bold mb-2.5">High-Yield Flashcard Revision</span>
                  
                  {/* Card container (Enlarged to h-56 with centered flex items) */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full h-56 perspective-1000 cursor-pointer relative"
                  >
                    <div className={`w-full h-full duration-500 transform-style-3d relative transition-transform ${isFlipped ? "rotate-y-180" : ""}`}>
                      
                      {/* Front Side */}
                      <div className="absolute w-full h-full backface-hidden bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-6.5 flex flex-col justify-between items-center text-center shadow-inner">
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-base sm:text-lg text-[var(--text-title)] font-extrabold leading-snug">
                            {FLASHCARDS[cardIndex].front}
                          </p>
                        </div>
                        <div className="text-[10px] text-[var(--color-accent)] font-bold tracking-wider font-mono uppercase mt-2 animate-pulse">
                          TAP CARD TO REVEAL MNEMONIC 🔄
                        </div>
                      </div>

                      {/* Back Side */}
                      <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-6.5 flex flex-col justify-between items-center text-center shadow-inner overflow-y-auto">
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-xs sm:text-sm text-[var(--text-main)] font-semibold leading-relaxed">
                            {FLASHCARDS[cardIndex].back}
                          </p>
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono uppercase mt-2">
                          TAP CARD TO RETURN
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Nav controls */}
                  <div className="flex items-center justify-between mt-4 px-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevFlashcard(); }}
                      className="px-4 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-main)] hover:text-[var(--text-title)] hover:font-bold hover:border-slate-400 transition"
                    >
                      &larr; Prev
                    </button>
                    <span className="text-xs font-mono text-slate-400 font-bold">
                      {cardIndex + 1} / {FLASHCARDS.length}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextFlashcard(); }}
                      className="px-4 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-main)] hover:text-[var(--text-title)] hover:font-bold hover:border-slate-400 transition"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- TAB 2: FOCUS ROOM (WIDESCREEN 3-COLUMN LAYOUT) --- */}
        {activeTab === "focus" && (
          <div className="fade-in-tab grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: Pomodoro Clock Block (Span 5) */}
            <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-[var(--card-shadow)] flex flex-col items-center relative overflow-hidden backdrop-blur-md min-h-[450px] justify-between">
              <div className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${mode === "study" ? "bg-rose-500/5" : "bg-cyan-500/5"}`} />
              
              <div className="flex items-center justify-between w-full border-b border-[var(--border-color)] pb-4">
                <h2 className="text-xs font-bold tracking-wider text-[var(--text-main)] font-mono uppercase flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-rose-500 animate-pulse" />
                  Rotation Clock
                </h2>

                <div className="flex bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-color)] shadow-inner">
                  <button
                    onClick={() => switchMode("study")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                      mode === "study"
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        : "text-[var(--text-main)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    Study (50m)
                  </button>
                  <button
                    onClick={() => switchMode("break")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                      mode === "break"
                        ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                        : "text-[var(--text-main)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    Break (10m)
                  </button>
                </div>
              </div>

              {/* Enlarged Circle Timer */}
              <div className="relative flex items-center justify-center my-8">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="58"
                    className="stroke-[var(--bg-primary)] fill-transparent"
                    strokeWidth="6"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="58"
                    className={`fill-transparent transition-all duration-300 ${mode === "study" ? "stroke-rose-500" : "stroke-cyan-500"}`}
                    strokeWidth="6"
                    strokeDasharray="364"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <div className="text-5xl font-mono font-black tracking-tighter text-[var(--text-title)] select-none">
                    {formatTime(timeLeft)}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-1.5 font-bold">
                    {mode === "study" ? "Active Duty" : "Relaxation"}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 w-full px-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-lg transition duration-300 hover:scale-[1.01] active:scale-95 ${
                    isRunning
                      ? "bg-amber-500 hover:bg-amber-400 text-white"
                      : mode === "study"
                      ? "bg-gradient-to-r from-rose-50 text-white bg-rose-500 shadow-rose-500/10"
                      : "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-cyan-500/10"
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isRunning ? "Pause Session" : "Start Session"}</span>
                </button>

                <button
                  onClick={resetTimer}
                  title="Reset Timer"
                  className="p-4 rounded-2xl bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-title)] transition duration-300 hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Column 2: Soundscapes & Audio (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-8 min-h-[450px]">
              
              {/* Soundscape Card */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-[var(--card-shadow)] backdrop-blur-md flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-3">
                    <h3 className="text-xs font-bold tracking-wider text-[var(--text-main)] font-mono uppercase flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-cyan-500" />
                      Ambient Audio Loops
                    </h3>
                    {activeAudio !== "silent" && (
                      <div className="flex items-end gap-0.5 h-3.5">
                        <span className="w-0.5 bg-cyan-500 rounded dance-bar" style={{height:'60%'}} />
                        <span className="w-0.5 bg-cyan-500 rounded dance-bar" style={{height:'100%', animationDelay:'0.1s'}} />
                        <span className="w-0.5 bg-cyan-500 rounded dance-bar" style={{height:'40%', animationDelay:'0.2s'}} />
                        <span className="w-0.5 bg-cyan-500 rounded dance-bar" style={{height:'85%', animationDelay:'0.3s'}} />
                      </div>
                    )}
                  </div>

                  {audioError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{audioError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => selectAudio("silent")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition duration-300 ${
                        activeAudio === "silent"
                          ? "bg-[var(--bg-primary)] border-[var(--color-secondary)] text-[var(--color-secondary)] shadow-sm scale-[0.98]"
                          : "bg-[var(--bg-primary)] border-transparent text-[var(--text-main)] opacity-70 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                    >
                      <VolumeX className="w-5 h-5 text-slate-400" />
                      <span>Silence</span>
                    </button>

                    <button
                      onClick={() => selectAudio("lofi")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition duration-300 ${
                        activeAudio === "lofi"
                          ? "bg-[var(--bg-primary)] border-[var(--color-secondary)] text-[var(--color-secondary)] shadow-sm scale-[0.98]"
                          : "bg-[var(--bg-primary)] border-transparent text-[var(--text-main)] opacity-70 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                    >
                      <Coffee className="w-5 h-5 text-amber-500" />
                      <span>Lo-Fi Beats</span>
                    </button>

                    <button
                      onClick={() => selectAudio("rain")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition duration-300 ${
                        activeAudio === "rain"
                          ? "bg-[var(--bg-primary)] border-[var(--color-secondary)] text-[var(--color-secondary)] shadow-sm scale-[0.98]"
                          : "bg-[var(--bg-primary)] border-transparent text-[var(--text-main)] opacity-70 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                    >
                      <Stethoscope className="w-5 h-5 text-indigo-400" />
                      <span>Rain Loop</span>
                    </button>

                    <button
                      onClick={() => selectAudio("hospital")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition duration-300 ${
                        activeAudio === "hospital"
                          ? "bg-[var(--bg-primary)] border-[var(--color-secondary)] text-[var(--color-secondary)] shadow-sm scale-[0.98]"
                          : "bg-[var(--bg-primary)] border-transparent text-[var(--text-main)] opacity-70 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                    >
                      <HeartPulse className="w-5 h-5 text-rose-500" />
                      <span>ER Hum Synth</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[var(--bg-primary)] px-4 py-3.5 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 accent-cyan-500 h-1 rounded-full cursor-pointer bg-slate-200 dark:bg-slate-800"
                  />
                  <span className="text-xs text-[var(--text-title)] font-mono w-8 text-right font-bold">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

            </div>

            {/* Column 3: Daily Boost & Checklist (Span 3) */}
            <div className="lg:col-span-3 flex flex-col gap-8 min-h-[450px]">
              
              {/* Daily Boost Quote Generator */}
              <div className="bg-gradient-to-br from-rose-50 dark:from-rose-950/20 via-[var(--bg-card)] to-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-[var(--card-shadow)] flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-extrabold px-2.5 py-1 bg-rose-500/10 rounded border border-rose-500/25">
                      {QUOTES[currentQuoteIndex].tag}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-title)] leading-relaxed italic min-h-[96px]">
                    "{displayText}"
                  </p>
                </div>

                <button
                  onClick={getNewQuote}
                  disabled={isDecrypting}
                  className={`mt-4 w-full py-3 px-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--color-accent)] rounded-xl flex items-center justify-center gap-2 transition duration-300 active:scale-95 ${
                    isDecrypting ? "opacity-60" : ""
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next Encourage</span>
                </button>
              </div>

              {/* Rotation Checklist Goals */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-[var(--card-shadow)] flex flex-col backdrop-blur-md">
                <h3 className="text-xs font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                    Checklist Goals
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {tasks.filter((t) => t.done).length}/{tasks.length} Done
                  </span>
                </h3>

                <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`w-full text-left flex items-start gap-2.5 p-3 rounded-xl transition border ${
                        task.done
                          ? "bg-[var(--bg-primary)]/50 border-[var(--border-color)] text-slate-400 line-through opacity-85"
                          : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-title)] hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-[11px] leading-snug">{task.text}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={addTask} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Queue new MBBS topic..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-title)] rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    Add
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 3: MEMORIES VAULT (POLAROID PHOTO DECK GRID) --- */}
        {activeTab === "memories" && (
          <div className="fade-in-tab flex flex-col gap-8">
            
            {/* Header section with Drive launcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl shadow-[var(--card-shadow)] backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-title)] tracking-tight flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                  Childhood Archives & Family Memories
                </h2>
                <p className="text-xs text-[var(--text-main)] opacity-75 mt-0.5">
                  Pre-configured Polaroid slideshow from your brother Prabal's vault.
                </p>
              </div>

              <a
                href={gdriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
              >
                <FolderOpen className="w-4 h-4" />
                <span>View Full Drive Album</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            {/* Polaroid Masonry/Deck Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CONFIG.memories.map((photo, index) => (
                <div 
                  key={photo.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-[var(--card-shadow)] flex flex-col items-center backdrop-blur-md justify-between hover:scale-[1.01] transition-transform duration-300"
                >
                  {/* Polaroid Frame */}
                  <div 
                    className={`polaroid-frame w-full bg-white border border-slate-200 p-4 pb-8 flex flex-col items-center rounded shadow-lg transform transition-all duration-300 ${
                      index === 0 ? "rotate-[-1.5deg]" : index === 1 ? "rotate-[2deg]" : "rotate-[-1deg]"
                    }`}
                  >
                    <div className="w-full aspect-[4/3] bg-slate-900 overflow-hidden rounded border border-slate-100 relative">
                      <img
                        src={photo.image}
                        alt={photo.title}
                        className="w-full h-full object-cover filter contrast-[1.02] brightness-[0.98]"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML = `
                            <div class="flex flex-col items-center justify-center w-full h-full p-4 bg-slate-950 text-slate-500">
                              <span class="text-[10px] font-mono uppercase tracking-wider">${photo.title}</span>
                              <span class="text-[9px] mt-1 opacity-70">(Please place ${photo.image} in public/memories/)</span>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <div className="mt-4 text-slate-700 font-mono text-[11px] text-center font-bold tracking-tight">
                      {photo.date} • {photo.title}
                    </div>
                  </div>

                  {/* Caption card */}
                  <div className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-2xl shadow-inner mt-5 text-center">
                    <p className="text-xs text-[var(--text-title)] font-semibold leading-relaxed">
                      "{photo.caption}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* --- TAB 4: SUPPORT DESK (REDESIGNED FOR 1-CLICK INSTANT WHATSAPP LINKS) --- */}
        {activeTab === "support" && (
          <div className="fade-in-tab grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Support trigger center (Span 5) */}
            <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-[var(--card-shadow)] flex flex-col justify-between backdrop-blur-md">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-500 animate-pulse" />
                  Remote Sibling Ticket Desk
                </h3>
                <p className="text-xs text-[var(--text-main)] opacity-70 mb-6">
                  Select a support action. Clicking a request will register it locally and immediately open WhatsApp to notify your brother in {locations.brother}!
                </p>

                {/* 1-Click WhatsApp Presets */}
                <div className="space-y-3.5 mb-6">
                  <button
                    onClick={() => triggerQuickSupport("Treat Sponsor")}
                    className="w-full p-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between text-left hover:scale-[1.01] hover:border-emerald-500/40 transition active:scale-95 group shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase">Zomato / Swiggy Delivery</span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-title)]">Sponsor Coffee & Snacks treat 🍔☕</span>
                    </div>
                    <Send className="w-4 h-4 text-emerald-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerQuickSupport("Remote Tech Session")}
                    className="w-full p-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between text-left hover:scale-[1.01] hover:border-emerald-500/40 transition active:scale-95 group shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase">Screen Share (Zoom/AnyDesk)</span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-title)]">Request Remote Tech Debugging 🖥️</span>
                    </div>
                    <Send className="w-4 h-4 text-emerald-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerQuickSupport("Venting Call")}
                    className="w-full p-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between text-left hover:scale-[1.01] hover:border-emerald-500/40 transition active:scale-95 group shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase">Phone Call</span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-title)]">Request 5m Motivation Call 📞</span>
                    </div>
                    <Send className="w-4 h-4 text-emerald-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerQuickSupport("Meme Request")}
                    className="w-full p-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between text-left hover:scale-[1.01] hover:border-emerald-500/40 transition active:scale-95 group shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase">Brain Break</span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-title)]">Request Sibling Meme / Joke 🎭</span>
                    </div>
                    <Send className="w-4 h-4 text-emerald-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                  </button>
                </div>

                {/* Custom Help WhatsApp Form */}
                <form onSubmit={handleCustomTicketSubmit} className="border-t border-[var(--border-color)] pt-5">
                  <label className="text-[10px] font-mono font-extrabold text-[var(--text-title)] uppercase block mb-1.5 tracking-wider">
                    Custom Manual Help Request
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type custom request details manually..."
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl px-4 py-3 text-xs text-[var(--text-title)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
                      maxLength={200}
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-[var(--border-color)] pt-5 mt-8 text-xs text-slate-400 font-mono text-center">
                Lucknow Remote WhatsApp Terminal
              </div>
            </div>

            {/* Right side: Ticket logs board (Span 7) */}
            <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-[var(--card-shadow)] flex flex-col backdrop-blur-md justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500 animate-pulse" />
                  Active Sibling Request Board
                </h3>
                <p className="text-xs text-[var(--text-main)] opacity-70 mb-5">
                  Click on the status tag to progress the workflow manually as you or your brother resolves it.
                </p>

                <div className="flex-grow overflow-y-auto max-h-[360px] flex flex-col gap-3 pr-1">
                  {tickets.length > 0 ? (
                    tickets.map((t) => (
                      <div 
                        key={t.id}
                        className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4.5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                              {t.type}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              #{t.id.toString().slice(-4)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--text-title)] font-bold mt-2.5 leading-relaxed">
                            {t.desc}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => advanceTicketStatus(t.id)}
                            title="Click to cycle status"
                            className={`px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold font-mono transition border ${
                              t.status === "OPEN"
                                ? "bg-blue-950/10 border-blue-500/20 text-blue-500"
                                : t.status === "PENDING"
                                ? "bg-yellow-950/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                : t.status === "IN PROGRESS"
                                ? "bg-purple-950/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
                                : "bg-emerald-950/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {t.status}
                          </button>
                          <button
                            onClick={() => deleteTicket(t.id)}
                            className="p-1.5 hover:text-red-500 text-slate-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 border border-dashed border-[var(--border-color)] rounded-[1.8rem] bg-[var(--bg-primary)]/30">
                      <p className="text-xs text-slate-400 font-mono">No logged support requests. Tech operations clear!</p>
                    </div>
                  )}
                </div>
              </div>

              {tickets.length > 0 && (
                <div className="border-t border-[var(--border-color)] pt-4 mt-6 text-center text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Real-time synchronization active
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* --- WIDESCREEN QR CODE AND FOOTER --- */}
      <footer className="w-full max-w-[1400px] mt-8 relative z-20">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[var(--card-shadow)] backdrop-blur-xl">
          
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-500 animate-pulse" />
              Gift Box QR Target Generator
            </h4>
            <p className="text-xs text-[var(--text-main)] opacity-75 max-w-xl leading-relaxed">
              Generate a printable QR code pointing to this website. Stick it on top of her physical gift box in Mathura so she can load it immediately!
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              <span>Target: {CONFIG.driveAlbumUrl}</span>
            </div>
          </div>

          <div className="flex items-center gap-5 bg-[var(--bg-primary)] p-4 rounded-3xl border border-[var(--border-color)] shrink-0 shadow-inner">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(CONFIG.driveAlbumUrl)}`}
              alt="Live Site QR Code"
              className="w-24 h-24 bg-white p-1.5 rounded-xl shadow-inner shrink-0"
            />
            <div className="text-left font-mono">
              <p className="text-[10px] text-slate-400">STATUS: CURATED</p>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">SCAN FOR DASHBOARD</p>
            </div>
          </div>

        </div>

        <div className="mt-12 text-center text-xs text-slate-500 font-mono">
          <p>Built with ❤️ by your in-house B.Tech support engineer • Raksha Bandhan Edition</p>
          <p className="text-slate-400 dark:text-slate-600 mt-1.5">Protected under remote sibling care protocols. {locations.brother} &harr; {locations.sister}.</p>
        </div>
      </footer>

    </div>
  );
}
