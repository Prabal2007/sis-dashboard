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
  Plus,
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
  BookOpen,
  ExternalLink
} from "lucide-react";

// --- IndexedDB Configuration for Memories Gallery ---
const DB_NAME = "SiblingMemoriesDB";
const STORE_NAME = "images";

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveImageToDB(base64Data) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add({ data: base64Data, timestamp: Date.now() });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getImagesFromDB() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteImageFromDB(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

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
  // --- Theme State (Light by default, custom cream look) ---
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

  // --- Sister / Brother Customization ---
  const [sisterName, setSisterName] = useState(() => {
    return localStorage.getItem("sis_dashboard_name") || "Didi";
  });
  const [brotherWhatsApp, setBrotherWhatsApp] = useState(() => {
    return localStorage.getItem("sis_dashboard_whatsapp") || "";
  });
  const [gdriveLink, setGDriveLink] = useState(() => {
    return localStorage.getItem("sis_dashboard_gdrive") || "https://drive.google.com";
  });
  const [qrUrl, setQrUrl] = useState(() => {
    return localStorage.getItem("sis_dashboard_qr_url") || window.location.href;
  });

  // Edit Mode states for Hub Setup
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [nameInput, setNameInput] = useState(sisterName);
  const [whatsappInput, setWhatsappInput] = useState(brotherWhatsApp);
  const [gdriveInput, setGDriveInput] = useState(gdriveLink);
  const [qrUrlInput, setQrUrlInput] = useState(qrUrl);

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

  // --- Caffeine Fuel Level ---
  const [caffeineLevel, setCaffeineLevel] = useState(() => {
    const saved = localStorage.getItem("sis_dashboard_caffeine");
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- Sibling Support Tickets ---
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem("sis_dashboard_tickets");
    return saved ? JSON.parse(saved) : [
      { id: 1, type: "Treat Sponsor", desc: "Urgent double-shot latte required at study desk.", status: "PENDING" },
      { id: 2, type: "Remote Tech Session", desc: "Vite dev server slow response debugging support.", status: "RESOLVED" }
    ];
  });
  const [ticketType, setTicketType] = useState("Treat Sponsor");
  const [ticketDesc, setTicketDesc] = useState("");

  // --- Memories Gallery ---
  const [memories, setMemories] = useState([]);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("sis_dashboard_name", sisterName);
  }, [sisterName]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_whatsapp", brotherWhatsApp);
  }, [brotherWhatsApp]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_gdrive", gdriveLink);
  }, [gdriveLink]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_qr_url", qrUrl);
  }, [qrUrl]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_caffeine", caffeineLevel);
  }, [caffeineLevel]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_tickets", JSON.stringify(tickets));
  }, [tickets]);

  // Load photos from IndexedDB
  useEffect(() => {
    getImagesFromDB().then((imgs) => {
      setMemories(imgs);
    });
  }, []);

  // Memories Slideshow Loop
  useEffect(() => {
    if (memories.length <= 1) return;
    const interval = setInterval(() => {
      setSlideshowIndex((prev) => (prev + 1) % memories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [memories]);

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

  // --- Audio Synthesis Controls ---
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

      // ECG Heart monitor beep at 60 BPM (1s interval)
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

  useEffect(() => {
    return () => {
      stopHospitalSynth();
    };
  }, []);

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
  const strokeDashoffset = 314 - (314 * progressPercentage) / 100;

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

  // --- Realistic Sibling WhatsApp Dispatch ---
  const dispatchWhatsAppMessage = (type, customDesc = "") => {
    if (!brotherWhatsApp.trim()) {
      alert("Please configure your brother's WhatsApp number on the Home tab first!");
      setActiveTab("home");
      return;
    }
    
    // Clean country formats (strip brackets, space, dashes)
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

  const addTicket = (e) => {
    e.preventDefault();
    const desc = ticketType === "Custom Help Request" ? ticketDesc.trim() : `Requesting a ${ticketType}`;
    if (ticketType === "Custom Help Request" && !ticketDesc.trim()) return;
    
    const newT = { id: Date.now(), type: ticketType, desc, status: "OPEN" };
    setTickets([...tickets, newT]);
    setTicketDesc("");

    // Trigger immediate realistic WhatsApp link redirection
    dispatchWhatsAppMessage(ticketType, desc);
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

  // --- Photo Upload Handlers ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload photos under 2MB to ensure smooth loading.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      await saveImageToDB(base64);
      const updated = await getImagesFromDB();
      setMemories(updated);
      setSlideshowIndex(updated.length - 1);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async (id) => {
    await deleteImageFromDB(id);
    const updated = await getImagesFromDB();
    setMemories(updated);
    setSlideshowIndex(0);
  };

  // Settings Save Handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSisterName(nameInput.trim() || "Didi");
    setBrotherWhatsApp(whatsappInput.trim());
    setGDriveLink(gdriveInput.trim() || "https://drive.google.com");
    setQrUrl(qrUrlInput.trim() || window.location.href);
    setIsEditingSettings(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center select-none selection:bg-rose-500/20 selection:text-rose-600 transition-colors duration-500 relative pb-10">
      
      {/* Visual Floating Ambient Orbs */}
      <div className="absolute top-10 left-[5%] w-72 h-72 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-[5%] w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden Loop Audios */}
      <audio ref={lofiAudioRef} src="https://www.chosic.com/wp-content/uploads/2021/04/Warm-Lights.mp3" loop preload="auto" />
      <audio ref={rainAudioRef} src="https://www.soundjay.com/nature/sounds/rain-07.mp3" loop preload="auto" />

      {/* --- TOP GLOBAL NAVIGATION HEADER --- */}
      <header className="w-full max-w-5xl px-4 mt-6 sm:mt-8 relative z-20">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[var(--card-shadow)] backdrop-blur-xl">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-[var(--color-accent)] animate-pulse">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-title)] flex items-center gap-2">
                Dr. {sisterName}'s Survival Terminal
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-[var(--color-accent)] border border-rose-500/25">
                  Remote Edition
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-[var(--text-main)] opacity-80">
                Mathura 📍 Lucknow Care Package Link
              </p>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav className="flex flex-wrap items-center bg-[var(--bg-primary)] p-1 rounded-2xl border border-[var(--border-color)] gap-0.5">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "home"
                  ? "bg-[var(--bg-card)] text-[var(--text-title)] shadow-sm"
                  : "text-[var(--text-main)] opacity-70 hover:opacity-100"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home Hub</span>
            </button>
            <button
              onClick={() => setActiveTab("focus")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "focus"
                  ? "bg-[var(--bg-card)] text-[var(--text-title)] shadow-sm"
                  : "text-[var(--text-main)] opacity-70 hover:opacity-100"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Focus Room</span>
            </button>
            <button
              onClick={() => setActiveTab("memories")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "memories"
                  ? "bg-[var(--bg-card)] text-[var(--text-title)] shadow-sm"
                  : "text-[var(--text-main)] opacity-70 hover:opacity-100"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Memories Vault</span>
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "support"
                  ? "bg-[var(--bg-card)] text-[var(--text-title)] shadow-sm"
                  : "text-[var(--text-main)] opacity-70 hover:opacity-100"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Support Desk</span>
            </button>
          </nav>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title="Toggle Light/Dark Theme"
            className="p-3 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-title)] rounded-2xl shadow-inner transition active:scale-95 shrink-0"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* --- CONTENT CONTAINER WITH TAB ROUTING --- */}
      <main className="w-full max-w-5xl px-4 mt-6 sm:mt-8 relative z-20 flex-1 flex flex-col">
        
        {/* --- TAB 1: WELCOME & SETUP HUB --- */}
        {activeTab === "home" && (
          <div className="fade-in-tab flex flex-col gap-6">
            
            {/* Split layout: Intro card & Config form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Intro Welcome Card */}
              <div className="md:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-[var(--card-shadow)] flex flex-col justify-between backdrop-blur-md">
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-[var(--color-accent)] font-bold uppercase block mb-3">
                    Raksha Bandhan Special Package
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-title)] tracking-tight mb-4 flex items-center gap-2">
                    Why I Built This For You
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </h2>
                  <div className="text-sm text-[var(--text-main)] leading-relaxed space-y-4 font-sans opacity-95">
                    <p className="font-semibold text-rose-500 dark:text-rose-400">Hey Didi,</p>
                    <p>
                      I know medical school rotations are demanding, clinical postings are exhausting, and the vivas are stressful. 
                      Since you are studying in <strong>Mathura</strong> and I am in <strong>Lucknow</strong>, I wanted to engineer 
                      something physical that bridges the distance.
                    </p>
                    <p>
                      This is your personal <strong>B.Tech remote care station</strong>. It provides study ambient loops, a custom circular Pomodoro timer, 
                      caffeine status tracking, and a photo deck for family memories.
                    </p>
                    <p className="font-semibold italic text-slate-800 dark:text-slate-100">
                      "Happy studying! Even from Lucknow, B.Tech support is always on call." ❤️
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 border-t border-[var(--border-color)] pt-5">
                  <button
                    onClick={() => setActiveTab("focus")}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-500/10 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Launch Focus Terminal</span>
                    <Terminal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Custom Settings Config Box */}
              <div className="md:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] flex flex-col justify-between backdrop-blur-md">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-title)] mb-1 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-500" />
                    Dashboard Config Desk
                  </h3>
                  <p className="text-[11px] text-[var(--text-main)] opacity-70 mb-5">
                    Personalize your dashboard values. Everything is saved locally in your browser.
                  </p>

                  {isEditingSettings ? (
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono font-bold text-[var(--text-title)] uppercase block mb-1">
                          Sister's Name
                        </label>
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] outline-none focus:border-[var(--color-accent)]"
                          maxLength={12}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold text-[var(--text-title)] uppercase block mb-1">
                          Brother's WhatsApp (e.g. 919876543210)
                        </label>
                        <input
                          type="text"
                          value={whatsappInput}
                          onChange={(e) => setWhatsappInput(e.target.value)}
                          placeholder="Include country code (no +)"
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] outline-none focus:border-[var(--color-accent)]"
                        />
                        <span className="text-[9px] text-slate-400 block mt-1">Used to dispatch remote requests</span>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold text-[var(--text-title)] uppercase block mb-1">
                          Shared Google Drive link
                        </label>
                        <input
                          type="text"
                          value={gdriveInput}
                          onChange={(e) => setGDriveInput(e.target.value)}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold text-[var(--text-title)] uppercase block mb-1">
                          Deployment Link (For QR generation)
                        </label>
                        <input
                          type="text"
                          value={qrUrlInput}
                          onChange={(e) => setQrUrlInput(e.target.value)}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
                        >
                          Save Config
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingSettings(false)}
                          className="py-2 px-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-title)] text-xs rounded-xl transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3.5 text-xs text-[var(--text-main)]">
                      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">Sister Identity</span>
                          <span className="font-bold text-[var(--text-title)]">Dr. {sisterName}</span>
                        </div>
                      </div>

                      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">WhatsApp Link</span>
                          <span className="font-mono font-bold text-[var(--text-title)] truncate max-w-[200px] block">
                            {brotherWhatsApp || "Not Configured ⚠️"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">Drive Album</span>
                          <span className="font-mono font-bold text-[var(--text-title)] truncate max-w-[200px] block">
                            {gdriveLink}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setNameInput(sisterName);
                          setWhatsappInput(brotherWhatsApp);
                          setGDriveInput(gdriveLink);
                          setQrUrlInput(qrUrl);
                          setIsEditingSettings(true);
                        }}
                        className="w-full py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-title)] transition"
                      >
                        Adjust Setup Details
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--border-color)] pt-4 mt-6 text-center text-[10px] text-slate-400 font-mono">
                  B.Tech configuration files: OK
                </div>
              </div>

            </div>

            {/* Features Guide Grid (Visual explanation cards) */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-[var(--card-shadow)] backdrop-blur-md">
              <h3 className="text-base font-bold text-[var(--text-title)] tracking-tight mb-5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Terminal Operational Guide
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold mb-3 text-sm">1</div>
                    <h4 className="text-xs font-extrabold text-[var(--text-title)] mb-1 uppercase font-mono">Focus Timer</h4>
                    <p className="text-[11px] text-[var(--text-main)] leading-relaxed">
                      A rigid 50-minute study segment locked with 10-minute breaks to optimize memory retention based on high-yield models.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("focus")} 
                    className="text-[10px] text-rose-500 font-bold hover:underline text-left mt-4"
                  >
                    Open Timer &rarr;
                  </button>
                </div>

                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold mb-3 text-sm">2</div>
                    <h4 className="text-xs font-extrabold text-[var(--text-title)] mb-1 uppercase font-mono">Soundscape</h4>
                    <p className="text-[11px] text-[var(--text-main)] leading-relaxed">
                      Toggle ambient sounds or lo-fi streams. Use the custom synthesiser to simulate ward equipment cooling hum & ECG heart monitor beats.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("focus")} 
                    className="text-[10px] text-cyan-500 font-bold hover:underline text-left mt-4"
                  >
                    Select Tracks &rarr;
                  </button>
                </div>

                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold mb-3 text-sm">3</div>
                    <h4 className="text-xs font-extrabold text-[var(--text-title)] mb-1 uppercase font-mono">Memories Box</h4>
                    <p className="text-[11px] text-[var(--text-main)] leading-relaxed">
                      Drag & drop childhood pictures. Saved locally inside the browser's IndexedDB so they load immediately on opening.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("memories")} 
                    className="text-[10px] text-purple-500 font-bold hover:underline text-left mt-4"
                  >
                    Upload Photo &rarr;
                  </button>
                </div>

                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold mb-3 text-sm">4</div>
                    <h4 className="text-xs font-extrabold text-[var(--text-title)] mb-1 uppercase font-mono">Remote Support</h4>
                    <p className="text-[11px] text-[var(--text-main)] leading-relaxed">
                      Request snack treats, schedule debugging Zoom calls, or ask for motivation. Converts requests into direct WhatsApp triggers.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("support")} 
                    className="text-[10px] text-emerald-500 font-bold hover:underline text-left mt-4"
                  >
                    Submit Ticket &rarr;
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: FOCUS ROOM --- */}
        {activeTab === "focus" && (
          <div className="fade-in-tab grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side: Clock Progress Visual */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Pomodoro block */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-[var(--card-shadow)] flex flex-col items-center relative overflow-hidden backdrop-blur-md">
                <div className={`absolute -top-24 -right-24 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${mode === "study" ? "bg-rose-500/5" : "bg-cyan-500/5"}`} />
                
                <div className="flex items-center justify-between w-full mb-6 border-b border-[var(--border-color)] pb-4">
                  <h2 className="text-xs font-bold tracking-wider text-[var(--text-main)] font-mono uppercase flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-rose-500 animate-pulse" />
                    Med Study Rotation Clock
                  </h2>

                  <div className="flex bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-color)]">
                    <button
                      onClick={() => switchMode("study")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        mode === "study"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : "text-[var(--text-main)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      Study (50m)
                    </button>
                    <button
                      onClick={() => switchMode("break")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        mode === "break"
                          ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                          : "text-[var(--text-main)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      Break (10m)
                    </button>
                  </div>
                </div>

                {/* SVG Countdown */}
                <div className="relative flex items-center justify-center my-6">
                  <svg className="w-56 h-56 transform -rotate-90">
                    <circle
                      cx="112"
                      cy="112"
                      r="50"
                      className="stroke-[var(--bg-primary)] fill-transparent"
                      strokeWidth="5"
                    />
                    <circle
                      cx="112"
                      cy="112"
                      r="50"
                      className={`fill-transparent transition-all duration-300 ${mode === "study" ? "stroke-rose-500" : "stroke-cyan-500"}`}
                      strokeWidth="5"
                      strokeDasharray="314"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <div className="text-4xl sm:text-5xl font-mono font-black tracking-tighter text-[var(--text-title)] select-none">
                      {formatTime(timeLeft)}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-1">
                      {mode === "study" ? "Active Duty" : "Relaxation"}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition active:scale-95 ${
                      isRunning
                        ? "bg-amber-500 hover:bg-amber-400 text-white"
                        : mode === "study"
                        ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-500/10"
                        : "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-cyan-500/10"
                    }`}
                  >
                    {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isRunning ? "Pause" : "Start Session"}</span>
                  </button>

                  <button
                    onClick={resetTimer}
                    title="Reset Timer"
                    className="p-3.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-title)] transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Soundscape Card */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] backdrop-blur-md">
                <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-3">
                  <h3 className="text-xs font-bold tracking-wider text-[var(--text-main)] font-mono uppercase flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-500" />
                    Ambient Sound Waves
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

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => selectAudio("silent")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2.5 transition ${
                      activeAudio === "silent"
                        ? "bg-[var(--bg-primary)] border-[var(--color-secondary)] text-[var(--color-secondary)] shadow-sm"
                        : "bg-[var(--bg-primary)] border-transparent text-[var(--text-main)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <VolumeX className="w-5 h-5 text-slate-400" />
                    <span>Silent Study</span>
                  </button>

                  <button
                    onClick={() => selectAudio("lofi")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2.5 transition ${
                      activeAudio === "lofi"
                        ? "bg-[var(--bg-primary)] border-[var(--color-secondary)] text-[var(--color-secondary)] shadow-sm"
                        : "bg-[var(--bg-primary)] border-transparent text-[var(--text-main)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Coffee className="w-5 h-5 text-amber-500" />
                    <span>Lo-Fi Beats</span>
                  </button>

                  <button
                    onClick={() => selectAudio("rain")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2.5 transition ${
                      activeAudio === "rain"
                        ? "bg-[var(--bg-primary)] border-[var(--color-secondary)] text-[var(--color-secondary)] shadow-sm"
                        : "bg-[var(--bg-primary)] border-transparent text-[var(--text-main)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Stethoscope className="w-5 h-5 text-indigo-400" />
                    <span>Soft Rain Loop</span>
                  </button>

                  <button
                    onClick={() => selectAudio("hospital")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2.5 transition ${
                      activeAudio === "hospital"
                        ? "bg-[var(--bg-primary)] border-[var(--color-secondary)] text-[var(--color-secondary)] shadow-sm"
                        : "bg-[var(--bg-primary)] border-transparent text-[var(--text-main)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <HeartPulse className="w-5 h-5 text-rose-500" />
                    <span>Med ER Hum (Synth)</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-[var(--bg-primary)] px-4 py-3 rounded-xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Volume</span>
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

            {/* Right side: Boost, Checklists, Caffeine levels */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Daily Boost encouragement block */}
              <div className="bg-gradient-to-br from-rose-50 dark:from-rose-950/20 via-[var(--bg-card)] to-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-bold px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/25">
                      {QUOTES[currentQuoteIndex].tag}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-title)] leading-relaxed italic min-h-[80px]">
                    "{displayText}"
                  </p>
                </div>

                <button
                  onClick={getNewQuote}
                  disabled={isDecrypting}
                  className={`mt-4 w-full py-2.5 px-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--color-accent)] rounded-xl flex items-center justify-center gap-2 transition active:scale-95 ${
                    isDecrypting ? "opacity-60" : ""
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dispense Encouragement</span>
                </button>
              </div>

              {/* Checklist */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] flex flex-col backdrop-blur-md">
                <h3 className="text-xs font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Study Rotation Goals
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {tasks.filter((t) => t.done).length}/{tasks.length} Resolved
                  </span>
                </h3>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition border ${
                        task.done
                          ? "bg-[var(--bg-primary)]/50 border-[var(--border-color)] text-slate-400 line-through opacity-80"
                          : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-title)] hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-xs leading-snug">{task.text}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={addTask} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Queue new study topic..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-title)] rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Caffeine Level */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 shadow-[var(--card-shadow)] backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[var(--text-title)] uppercase font-mono tracking-wider flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600 animate-bounce" />
                    Caffeine Core Monitor
                  </h3>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    {caffeineLevel} Cups
                  </span>
                </div>

                <div className="relative w-full h-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                    style={{ width: `${Math.min(caffeineLevel * 20, 100)}%` }}
                  />
                </div>

                <p className="text-[10px] text-[var(--text-main)] font-mono mb-4 text-center opacity-80">
                  {caffeineLevel === 0 && "Status: Zombie Desk Mode (Need refueling)"}
                  {caffeineLevel > 0 && caffeineLevel <= 2 && "Status: Synapses firing. Alertness nominal."}
                  {caffeineLevel >= 3 && caffeineLevel <= 4 && "Status: Harrison's speedrunner mode."}
                  {caffeineLevel >= 5 && "Status: WARNING! Jittery surgeon. Hands shaking!"}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCaffeineLevel((prev) => prev + 1)}
                    className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Coffee Cup</span>
                  </button>
                  <button
                    onClick={() => setCaffeineLevel(0)}
                    className="py-2 px-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-title)] rounded-xl text-xs font-semibold transition hover:bg-[var(--bg-card)]"
                  >
                    Reset
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 3: MEMORIES VAULT --- */}
        {activeTab === "memories" && (
          <div className="fade-in-tab grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Tilted Polaroid Display */}
            <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] flex flex-col items-center backdrop-blur-md">
              <h3 className="text-xs font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Featured Memory Polaroid
              </h3>

              {/* Polaroid Photo Frame */}
              <div className="polaroid-frame w-full max-w-[280px] bg-white border border-slate-200 p-4 pb-8 flex flex-col items-center rounded shadow-2xl rotate-2 hover:rotate-0 transform transition-all duration-300">
                <div className="w-full aspect-[4/3] bg-slate-900 overflow-hidden rounded border border-slate-200 flex items-center justify-center relative">
                  {memories.length > 0 ? (
                    <img
                      src={memories[slideshowIndex].data}
                      alt="Polaroid Memory"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <ImageIcon className="w-10 h-10 text-slate-500 mb-2 animate-bounce" />
                      <span className="text-[10px] text-slate-400 font-mono">Vault Empty</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-slate-700 font-mono text-[11px] text-center font-bold tracking-tight">
                  {memories.length > 0 ? `Mathura 📸 Lucknow • #${slideshowIndex + 1}` : "No photos loaded yet"}
                </div>
              </div>

              {/* Open shared drive Link */}
              <div className="w-full mt-6 pt-5 border-t border-[var(--border-color)] flex flex-col gap-2.5">
                <a
                  href={gdriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Launch Google Drive Folder</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
                <span className="text-[9px] text-slate-400 font-mono text-center">
                  Configured URL: {gdriveLink.slice(0, 45)}...
                </span>
              </div>
            </div>

            {/* Right Column: Upload workspace and Grid gallery */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Image upload area */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] backdrop-blur-md">
                <h3 className="text-xs font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-500" />
                  Upload Memory Workspace
                </h3>
                <p className="text-[11px] text-[var(--text-main)] opacity-70 mb-4">
                  Add photos of you, your brother, or family. They are stored locally on your device for absolute privacy.
                </p>

                {/* Drop Workspace */}
                <label className="border-2 border-dashed border-[var(--border-color)] hover:border-purple-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-[var(--bg-primary)]/50">
                  <Plus className="w-8 h-8 text-slate-400 mb-2 hover:text-purple-500 transition" />
                  <span className="text-xs font-bold text-[var(--text-title)]">Choose Image File</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">Accepts PNG, JPG (Max 2MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Gallery Grid */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] backdrop-blur-md flex-1">
                <h3 className="text-xs font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-4 flex items-center justify-between">
                  <span>Memories Shelf ({memories.length} Photos)</span>
                  {memories.length > 0 && <span className="text-[9px] text-slate-400">Slideshow loops active</span>}
                </h3>

                {memories.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {memories.map((img, idx) => (
                      <div 
                        key={img.id}
                        onClick={() => setSlideshowIndex(idx)}
                        className={`group relative aspect-square bg-slate-950 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                          idx === slideshowIndex ? "border-purple-500 scale-[0.98]" : "border-transparent opacity-85 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.data}
                          alt="Thumb"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(img.id);
                          }}
                          title="Delete Photo"
                          className="absolute top-1 right-1 p-1 bg-red-950/80 border border-red-500/30 text-red-400 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-900 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-primary)]/30">
                    <p className="text-xs text-slate-400 font-mono">No images uploaded. Add some to start the deck!</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 4: SUPPORT DESK --- */}
        {activeTab === "support" && (
          <div className="fade-in-tab grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left side: Raising tickets */}
            <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] flex flex-col justify-between backdrop-blur-md">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-1 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Remote Sibling Ticket Desk
                </h3>
                <p className="text-[11px] text-[var(--text-main)] opacity-70 mb-4">
                  Raise a ticket to your brother in Lucknow. Submitting will format and WhatsApp the request directly to him!
                </p>

                <form onSubmit={addTicket} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-[var(--text-title)] uppercase block mb-1">
                      Support Request Category
                    </label>
                    <select
                      value={ticketType}
                      onChange={(e) => setTicketType(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] outline-none focus:border-[var(--color-accent)] cursor-pointer"
                    >
                      <option value="Treat Sponsor">Order Treat (Zomato/Swiggy Sponsor)</option>
                      <option value="Remote Tech Session">Remote Tech Debugging (AnyDesk/Zoom)</option>
                      <option value="Venting Call">Request Venting/Motivation Call (5 mins)</option>
                      <option value="Meme Request">Send Meme / Laugh Request</option>
                      <option value="Custom Help Request">Custom Help Request...</option>
                    </select>
                  </div>

                  {ticketType === "Custom Help Request" && (
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[var(--text-title)] uppercase block mb-1">
                        Manual Help Description
                      </label>
                      <textarea
                        value={ticketDesc}
                        onChange={(e) => setTicketDesc(e.target.value)}
                        placeholder="Type exactly what you need help with manually..."
                        rows="3"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-title)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-accent)]"
                        maxLength={250}
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Open WhatsApp & Dispatch Request</span>
                  </button>
                </form>
              </div>

              <div className="border-t border-[var(--border-color)] pt-4 mt-6 text-[10px] text-slate-400 font-mono text-center">
                Destination: {brotherWhatsApp ? `Lucknow WhatsApp (+${brotherWhatsApp})` : "Not Configured ⚠️"}
              </div>
            </div>

            {/* Right side: Ticket logs board */}
            <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--card-shadow)] flex flex-col backdrop-blur-md">
              <h3 className="text-xs font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                Active Sibling Request Logs
              </h3>
              <p className="text-[11px] text-[var(--text-main)] opacity-70 mb-4">
                Click on the status tag to progress the workflow manually as you or your brother resolves it.
              </p>

              <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-2 pr-1">
                {tickets.length > 0 ? (
                  tickets.map((t) => (
                    <div 
                      key={t.id}
                      className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-inner"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {t.type}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            #{t.id.toString().slice(-4)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-title)] font-medium mt-2 truncate">
                          {t.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => advanceTicketStatus(t.id)}
                          title="Click to cycle status"
                          className={`px-2.5 py-1 rounded text-[9px] font-bold font-mono transition border ${
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
                          className="p-1 hover:text-red-500 text-slate-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)]/30">
                    <p className="text-xs text-slate-400 font-mono">No logged support requests. Tech operations clear!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* --- QR CODE GENERATION FOOTER & SHARE --- */}
      <footer className="w-full max-w-5xl px-4 mt-8 relative z-20">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[var(--card-shadow)] backdrop-blur-xl">
          
          <div className="flex-1">
            <h4 className="text-xs font-bold text-[var(--text-title)] uppercase font-mono tracking-wider mb-1 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-500" />
              Gift Box QR Target Generator
            </h4>
            <p className="text-[11px] text-[var(--text-main)] opacity-75 max-w-lg leading-relaxed">
              Generate a printable QR code pointing to this website. Stick it on top of her physical gift box in Mathura so she can load it immediately!
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              <span>Target: {qrUrl}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[var(--bg-primary)] p-3 rounded-2xl border border-[var(--border-color)] shrink-0 shadow-inner">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(qrUrl)}`}
              alt="Live Site QR Code"
              className="w-24 h-24 bg-white p-1 rounded-lg shadow-inner shrink-0"
            />
            <div className="text-left font-mono">
              <p className="text-[9px] text-slate-400">STATUS: READY</p>
              <p className="text-[9px] text-slate-400 mt-1">SCAN FOR DASHBOARD</p>
              <button
                onClick={() => {
                  const link = prompt("Enter deployment URL target for QR code:", qrUrl);
                  if (link !== null) setQrUrl(link.trim() || window.location.href);
                }}
                className="mt-2 py-1 px-3.5 bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[9px] font-bold text-[var(--text-title)] transition"
              >
                Modify URL
              </button>
            </div>
          </div>

        </div>

        <div className="mt-8 text-center text-[10px] text-slate-500 font-mono">
          <p>Built with ❤️ by your in-house B.Tech support engineer • Raksha Bandhan Edition</p>
          <p className="text-slate-400 dark:text-slate-600 mt-1">Protected under remote sibling care protocols. Lucknow &harr; Mathura.</p>
        </div>
      </footer>

    </div>
  );
}
