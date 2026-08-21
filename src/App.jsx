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
  Edit2,
  Plus,
  Trash2,
  QrCode,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  FolderOpen
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
  // --- Name State ---
  const [sisterName, setSisterName] = useState(() => {
    return localStorage.getItem("sis_dashboard_name") || "Didi";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(sisterName);

  // --- Timer States (50m Study / 10m Break) ---
  const [mode, setMode] = useState("study"); 
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // --- Audio State ---
  const [activeAudio, setActiveAudio] = useState("silent"); // 'silent' | 'lofi' | 'rain' | 'hospital'
  const [volume, setVolume] = useState(0.5);
  const [audioError, setAudioError] = useState("");
  
  // HTML5 audio elements refs
  const lofiAudioRef = useRef(null);
  const rainAudioRef = useRef(null);
  
  // Web Audio API refs for programmatically synthesized hospital sounds
  const audioCtxRef = useRef(null);
  const humOscRef = useRef(null);
  const humGainRef = useRef(null);
  const beepIntervalRef = useRef(null);

  // --- Quote State & Terminal Glitch Animation ---
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState(QUOTES[0].text);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // --- Checklist State ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("sis_dashboard_tasks");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Finish Pharmacology / Pathology high-yield notes", done: false },
      { id: 2, text: "Update clinical posting logbook", done: false },
      { id: 3, text: "Hydrate & take a 10-minute stretch", done: true },
    ];
  });
  const [newTask, setNewTask] = useState("");

  // --- Caffeine Fuel Level ---
  const [caffeineLevel, setCaffeineLevel] = useState(() => {
    const saved = localStorage.getItem("sis_dashboard_caffeine");
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- Sibling IT Support Tickets ---
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem("sis_dashboard_tickets");
    return saved ? JSON.parse(saved) : [
      { id: 1, type: "Coffee Refuel", desc: "Urgent double-shot latte required at study desk.", status: "PENDING" },
      { id: 2, type: "Robbins Weight", desc: "Textbook too heavy, need B.Tech automation to read for me.", status: "RESOLVED" }
    ];
  });
  const [ticketType, setTicketType] = useState("Coffee Refuel");
  const [ticketDesc, setTicketDesc] = useState("");

  // --- Memories Gallery ---
  const [memories, setMemories] = useState([]);
  const [gdriveLink, setGDriveLink] = useState(() => {
    return localStorage.getItem("sis_dashboard_gdrive") || "https://drive.google.com";
  });
  const [isEditingGDrive, setIsEditingGDrive] = useState(false);
  const [gdriveInput, setGDriveInput] = useState(gdriveLink);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  // --- QR Code Live URL ---
  const [qrUrl, setQrUrl] = useState(() => {
    return localStorage.getItem("sis_dashboard_qr_url") || window.location.href;
  });
  const [isEditingQRUrl, setIsEditingQRUrl] = useState(false);
  const [qrUrlInput, setQrUrlInput] = useState(qrUrl);

  // --- Persistent Storage Syncs ---
  useEffect(() => {
    localStorage.setItem("sis_dashboard_name", sisterName);
  }, [sisterName]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_caffeine", caffeineLevel);
  }, [caffeineLevel]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_gdrive", gdriveLink);
  }, [gdriveLink]);

  useEffect(() => {
    localStorage.setItem("sis_dashboard_qr_url", qrUrl);
  }, [qrUrl]);

  // Load photos from IndexedDB on startup
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
            // Play alarm sound if desired
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

  // --- Audio Synthesis and Control Logic ---
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
      
      // Low Hospital Vent Hum
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

      // ECG Heart Monitor Beep
      beepIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
        
        const beepOsc = audioCtxRef.current.createOscillator();
        const beepGain = audioCtxRef.current.createGain();
        
        beepOsc.type = "sine";
        // Slightly warm medical pitch
        beepOsc.frequency.setValueAtTime(920, audioCtxRef.current.currentTime);
        
        beepGain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        beepGain.gain.linearRampToValueAtTime(volume * 0.02, audioCtxRef.current.currentTime + 0.02);
        beepGain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.12);
        
        beepOsc.connect(beepGain);
        beepGain.connect(audioCtxRef.current.destination);
        beepOsc.start();
        beepOsc.stop(audioCtxRef.current.currentTime + 0.15);
      }, 1000); // 60 BPM
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
        // Hum oscillator was already stopped or not started
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
    // Stop all current playing
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

  // Safe release of audio on unmount
  useEffect(() => {
    return () => {
      stopHospitalSynth();
    };
  }, []);

  // --- Quote Change Terminal Decrypting Animation ---
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

  // --- Timer Handlers ---
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
  const strokeDashoffset = 283 - (283 * progressPercentage) / 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // --- Tasks Handlers ---
  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask("");
  };

  // --- IT Tickets Handlers ---
  const addTicket = (e) => {
    e.preventDefault();
    if (!ticketDesc.trim()) return;
    setTickets([
      ...tickets,
      { id: Date.now(), type: ticketType, desc: ticketDesc.trim(), status: "OPEN" }
    ]);
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

  // --- Photo Upload Logic ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (limit base64 scaling)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Keep it under 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      await saveImageToDB(base64);
      const updatedMemories = await getImagesFromDB();
      setMemories(updatedMemories);
      setSlideshowIndex(updatedMemories.length - 1);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async (id) => {
    await deleteImageFromDB(id);
    const updatedMemories = await getImagesFromDB();
    setMemories(updatedMemories);
    setSlideshowIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center select-none overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Background Decorative Glow Spots */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden Audio Elements for streaming loops */}
      <audio 
        ref={lofiAudioRef} 
        src="https://www.chosic.com/wp-content/uploads/2021/04/Warm-Lights.mp3" 
        loop 
        preload="auto" 
      />
      <audio 
        ref={rainAudioRef} 
        src="https://www.soundjay.com/nature/sounds/rain-07.mp3" 
        loop 
        preload="auto" 
      />

      {/* --- Header / Hero Title --- */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 py-5 px-6 mb-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl shadow-2xl relative z-10">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-400 shadow-lg shadow-rose-500/10 animate-pulse">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSisterName(nameInput.trim() || "Didi");
                        setIsEditingName(false);
                      }
                    }}
                    className="bg-slate-950 border border-rose-500 text-white px-3 py-1 rounded-lg text-lg font-bold outline-none focus:ring-1 focus:ring-rose-500"
                    maxLength={15}
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setSisterName(nameInput.trim() || "Didi");
                      setIsEditingName(false);
                    }}
                    className="p-1 text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Dr. {sisterName}'s Survival Dashboard
                  <button
                    onClick={() => {
                      setNameInput(sisterName);
                      setIsEditingName(true);
                    }}
                    title="Customize Sister's Name"
                    className="p-1 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </h1>
              )}
              
              <span className="text-[11px] self-center font-mono font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                v3.0 B.Tech Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Engineered with ❤️ for the future specialist • Powered by in-house B.Tech support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>B.Tech Emergency Line: ACTIVE</span>
        </div>
      </header>

      {/* --- Main Dashboard Body --- */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Pomodoro & Audio Center */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Pomodoro Study Timer */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden backdrop-blur-md">
            {/* Ambient Background Glow inside */}
            <div className={`absolute -top-24 -right-24 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${mode === "study" ? "bg-rose-500/10" : "bg-cyan-500/10"}`} />
            
            <div className="flex items-center justify-between w-full mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-sm font-bold tracking-wider text-slate-400 font-mono uppercase flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-rose-500" />
                Focus Rotation Lock
              </h2>
              
              {/* Presets */}
              <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => switchMode("study")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    mode === "study"
                      ? "bg-rose-500/25 text-rose-300 border border-rose-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Study (50m)
                </button>
                <button
                  onClick={() => switchMode("break")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    mode === "break"
                      ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Break (10m)
                </button>
              </div>
            </div>

            {/* Circular Timer Face */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="45"
                  className="stroke-slate-800/80 fill-transparent"
                  strokeWidth="6"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="45"
                  className={`fill-transparent transition-all duration-300 ${mode === "study" ? "stroke-rose-500" : "stroke-cyan-500"}`}
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <div className="text-4xl font-mono font-black tracking-tight text-white select-none">
                  {formatTime(timeLeft)}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mt-0.5">
                  {mode === "study" ? "Prescribing Focus" : "Charging Battery"}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition active:scale-95 ${
                  isRunning
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10"
                    : mode === "study"
                    ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-rose-500/20"
                    : "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white shadow-cyan-500/20"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Pause Cycle
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Initialize Cycle
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                title="Reset Timer"
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition border border-slate-700/50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ambience Audio Center */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-sm font-bold tracking-wider text-slate-400 font-mono uppercase mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Study Soundscape Unit
              </span>
              {activeAudio !== "silent" && (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 bg-cyan-400 rounded animate-[pulse_0.6s_infinite_alternate]" style={{height:'60%'}} />
                  <span className="w-0.5 bg-cyan-400 rounded animate-[pulse_0.4s_infinite_alternate]" style={{height:'100%', animationDelay:'0.1s'}} />
                  <span className="w-0.5 bg-cyan-400 rounded animate-[pulse_0.7s_infinite_alternate]" style={{height:'40%', animationDelay:'0.2s'}} />
                  <span className="w-0.5 bg-cyan-400 rounded animate-[pulse_0.5s_infinite_alternate]" style={{height:'80%', animationDelay:'0.3s'}} />
                </div>
              )}
            </h2>

            {/* Error alerts if auto-play blocked */}
            {audioError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{audioError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => selectAudio("silent")}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition ${
                  activeAudio === "silent"
                    ? "bg-slate-950 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/5"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <VolumeX className="w-5 h-5 text-slate-500" />
                Silence (Muted)
              </button>

              <button
                onClick={() => selectAudio("lofi")}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition ${
                  activeAudio === "lofi"
                    ? "bg-slate-950 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/5"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Coffee className="w-5 h-5 text-amber-400" />
                Lo-Fi Beats (Chosic)
              </button>

              <button
                onClick={() => selectAudio("rain")}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition ${
                  activeAudio === "rain"
                    ? "bg-slate-950 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/5"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Stethoscope className="w-5 h-5 text-indigo-400" />
                Study Rain (SoundJay)
              </button>

              <button
                onClick={() => selectAudio("hospital")}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition ${
                  activeAudio === "hospital"
                    ? "bg-slate-950 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/5"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <HeartPulse className="w-5 h-5 text-rose-400" />
                Med ER (Synth)
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-mono">VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 accent-cyan-500 h-1 rounded-full cursor-pointer bg-slate-800"
              />
              <span className="text-xs text-cyan-400 font-mono w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Quotes, Checklist, Caffeine Tracker, Memories */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Sibling Memory Gallery */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Sibling Memories Box
              </span>
            </h2>

            {/* Photo Slideshow Frame */}
            <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-3">
              {memories.length > 0 ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={memories[slideshowIndex].data}
                    alt="Sibling Memory"
                    className="max-w-full max-h-[85%] object-contain rounded-lg shadow-2xl"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => removePhoto(memories[slideshowIndex].id)}
                      title="Delete Image"
                      className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-400 hover:bg-red-900 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">
                    Memory {slideshowIndex + 1} of {memories.length}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <ImageIcon className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                  <p className="text-xs text-slate-400 font-medium">No photos uploaded yet.</p>
                  <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
                    Upload pictures of you, your sister, or family to display here!
                  </p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="mt-3 flex gap-2">
              <label className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-purple-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition">
                <Plus className="w-3.5 h-3.5" />
                Add Sibling Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Shared GDrive Link Launch */}
              <a
                href={gdriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-purple-950/30 border border-purple-500/20 hover:bg-purple-950/50 rounded-xl text-purple-300 transition flex items-center justify-center"
                title="Open Shared Google Drive Memories Folder"
              >
                <FolderOpen className="w-4 h-4" />
              </a>
            </div>

            {/* Google Drive Link Config */}
            <div className="mt-3 border-t border-slate-800/60 pt-3">
              {isEditingGDrive ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={gdriveInput}
                    onChange={(e) => setGDriveInput(e.target.value)}
                    placeholder="Paste GDrive Folder link..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => {
                      setGDriveLink(gdriveInput.trim() || "https://drive.google.com");
                      setIsEditingGDrive(false);
                    }}
                    className="p-1.5 bg-emerald-950 border border-emerald-500/30 text-emerald-300 rounded-lg"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono truncate max-w-[200px]">Drive: {gdriveLink}</span>
                  <button
                    onClick={() => {
                      setGDriveInput(gdriveLink);
                      setIsEditingGDrive(true);
                    }}
                    className="text-purple-400 hover:text-purple-300 underline font-semibold"
                  >
                    Configure Drive Folder
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Doctor's Daily Boost (Encouragement Generator) */}
          <div className="bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border border-rose-900/30 rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold px-2.5 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  {QUOTES[currentQuoteIndex].tag}
                </span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{animationDuration: '6s'}} />
              </div>
              <p className="text-sm font-medium text-slate-200 leading-relaxed italic min-h-[84px] font-sans selection:bg-rose-500/40">
                "{displayText}"
              </p>
            </div>

            <button
              onClick={getNewQuote}
              disabled={isDecrypting}
              className={`mt-4 w-full py-2.5 px-4 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 text-xs font-bold text-rose-300 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 ${
                isDecrypting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Dispense New Encouragement
            </button>
          </div>

          {/* Today's Checklist */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col shadow-2xl backdrop-blur-md">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Focus Rotation Checklist
              </span>
              <span className="text-xs font-mono font-normal text-slate-400">
                {tasks.filter((t) => t.done).length}/{tasks.length} Resolved
              </span>
            </h2>

            {/* Checklist items container */}
            <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition border ${
                    task.done
                      ? "bg-slate-950/30 border-slate-800/50 text-slate-500 line-through"
                      : "bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs leading-snug">{task.text}</span>
                </button>
              ))}
            </div>

            {/* Task add form */}
            <form onSubmit={addTask} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Queue medical topic..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition active:scale-95"
              >
                Add
              </button>
            </form>
          </div>

          {/* Caffeine Tracker */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-500 animate-bounce" />
                Caffeine Core Level
              </h2>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                {caffeineLevel} Cups
              </span>
            </div>

            {/* Visual Fuel Bar */}
            <div className="relative w-full h-4 bg-slate-950 border border-slate-800 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                style={{ width: `${Math.min(caffeineLevel * 20, 100)}%` }}
              />
            </div>

            {/* Alerts based on caffeine levels */}
            <p className="text-[11px] font-semibold text-slate-400 font-mono mb-4 text-center">
              {caffeineLevel === 0 && "Status: Sleeping on desk (Zombie Mode)"}
              {caffeineLevel > 0 && caffeineLevel <= 2 && "Status: Cognitive engines running optimally."}
              {caffeineLevel >= 3 && caffeineLevel <= 4 && "Status: Harrison's Textbook speedrunner activated."}
              {caffeineLevel >= 5 && "Status: WARNING! Jittery Surgeon Mode. Hands shaking!"}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCaffeineLevel((prev) => prev + 1)}
                className="flex-1 py-2 px-3 bg-amber-950/30 border border-amber-500/20 hover:bg-amber-950/50 rounded-xl text-xs font-bold text-amber-300 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Dispense Coffee Cup
              </button>
              <button
                onClick={() => setCaffeineLevel(0)}
                className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Reset
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* --- IT support ticket desk & QR Section --- */}
      <section className="w-full max-w-5xl mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* Ticket Raising Portal */}
        <div className="md:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              B.Tech IT Priority Help Desk
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Raise a support ticket directly to your brother. Click on a ticket's status badge to progress the workflow.
            </p>

            {/* List of current tickets */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto mb-4 pr-1">
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div 
                    key={t.id}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {t.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: #{t.id.toString().slice(-4)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 truncate">
                        {t.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => advanceTicketStatus(t.id)}
                        title="Click to cycle status"
                        className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition border ${
                          t.status === "OPEN"
                            ? "bg-blue-950/30 border-blue-500/20 text-blue-400"
                            : t.status === "PENDING"
                            ? "bg-yellow-950/30 border-yellow-500/20 text-yellow-400"
                            : t.status === "IN PROGRESS"
                            ? "bg-purple-950/30 border-purple-500/20 text-purple-400"
                            : "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {t.status}
                      </button>
                      <button
                        onClick={() => deleteTicket(t.id)}
                        className="p-1 hover:text-red-400 text-slate-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 font-mono">No active IT tickets. Tech operations are clear!</p>
                </div>
              )}
            </div>
          </div>

          {/* Ticket creation form */}
          <form onSubmit={addTicket} className="border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row gap-3">
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="Coffee Refuel">Coffee Emergency</option>
              <option value="Robbins Support">Robbins/Harrison Help</option>
              <option value="Viva Support">Viva Panic / Vent</option>
              <option value="Laptop Freeze">PC / Tech Glitch</option>
            </select>
            <input
              type="text"
              placeholder="Explain the technical emergency..."
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition active:scale-95 shrink-0"
            >
              Raise Ticket
            </button>
          </form>
        </div>

        {/* QR Code and Deployment details */}
        <div className="md:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-400" />
              Live Deployment QR
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Enter your live site URL to generate a custom QR code. Scan or print it to stick on her gift!
            </p>

            {/* QR display container */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrUrl)}`}
                alt="Live Site QR Code"
                className="w-32 h-32 bg-white p-1.5 rounded-lg shadow-inner"
              />
              <span className="text-[9px] text-slate-500 font-mono mt-2 truncate w-full text-center">
                {qrUrl}
              </span>
            </div>
          </div>

          {/* Edit QR link */}
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            {isEditingQRUrl ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={qrUrlInput}
                  onChange={(e) => setQrUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => {
                    setQrUrl(qrUrlInput.trim() || window.location.href);
                    setIsEditingQRUrl(false);
                  }}
                  className="p-1.5 bg-emerald-950 border border-emerald-500/30 text-emerald-300 rounded-lg"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Deploy Link:</span>
                <button
                  onClick={() => {
                    setQrUrlInput(qrUrl);
                    setIsEditingQRUrl(true);
                  }}
                  className="text-purple-400 hover:text-purple-300 underline font-semibold"
                >
                  Update QR Target
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="mt-12 mb-4 text-center text-[10px] text-slate-600 font-mono relative z-10 flex flex-col gap-2">
        <p>Built with ❤️ by your in-house B.Tech support engineer • Raksha Bandhan Edition</p>
        <p className="text-slate-700">Protected under Sibling Indemnity & Coffee Bribery Protocols.</p>
      </footer>
    </div>
  );
}
