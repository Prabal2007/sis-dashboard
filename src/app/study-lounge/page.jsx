"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Stethoscope, Volume2, VolumeX, Plus, Trash2, BookOpen, Smile, ChevronRight, Upload } from "lucide-react";

// Curated medical mnemonics with sibling banter
const MNEMONICS = [
  {
    id: 1,
    subject: "Anatomy 🦴",
    front: "Carpal Bones Order",
    back: "She Looks Too Pretty, Try To Catch Her. (Scaphoid, Lunate, Triquetrum, Pisiform, Hamate, Capitate, Trapezoid, Trapezium. Relax your wrists!)",
    color: "bg-amber-100/70 border-amber-200 text-amber-900"
  },
  {
    id: 2,
    subject: "Physiology 🧠",
    front: "Cranial Nerves",
    back: "Some Say Marry Money, But My Brother Says Big Brains Matter More. (Sensory, Sensory, Motor, Motor, Both, Motor, Both, Sensory, Both, Both, Motor, Motor. Focus!)",
    color: "bg-rose-100/70 border-rose-200 text-rose-900"
  },
  {
    id: 3,
    subject: "Pathology 🩺",
    front: "Circle of Willis",
    back: "Posterior Cerebral, Posterior Communicating, Internal Carotid, Anterior Cerebral, Anterior Communicating. (Complex vascular hub!)",
    color: "bg-emerald-100/70 border-emerald-200 text-emerald-900"
  },
  {
    id: 4,
    subject: "Pharmacology 💊",
    front: "Tuberculosis First-Line",
    back: "PRISE: Pyrazinamide, Rifampicin, Isoniazid, Streptomycin, Ethambutol. (Essential high-yield clinical ammo!)",
    color: "bg-blue-100/70 border-blue-200 text-blue-900"
  }
];

export default function StudyLounge() {
  const [mode, setMode] = useState("study"); // study | break
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Audio Channels State
  const [audioChannels, setAudioChannels] = useState({
    lofi: { active: false, volume: 0.5, url: "https://www.chosic.com/wp-content/uploads/2021/04/Warm-Lights.mp3" },
    rain: { active: false, volume: 0.5, url: "https://www.soundjay.com/nature/sounds/rain-07.mp3" },
    cafe: { active: false, volume: 0.4, url: "https://assets.mixkit.co/active_storage/sfx/1000/1000-84.wav" }, // static coffee cup loop
    hum: { active: false, volume: 0.3 } // Synthesized ward hum
  });

  // Custom added tracks (local files or online URLs)
  const [customTracks, setCustomTracks] = useState([]);
  const [showAddSoundForm, setShowAddSoundForm] = useState(false);
  
  // Custom Track inputs
  const [customTrackName, setCustomTrackName] = useState("");
  const [customTrackUrl, setCustomTrackUrl] = useState("");
  const [audioFileError, setAudioFileError] = useState("");

  const [globalVolume, setGlobalVolume] = useState(0.8);
  const [audioError, setAudioError] = useState("");

  const lofiRef = useRef(null);
  const rainRef = useRef(null);
  const cafeRef = useRef(null);
  
  // Web Audio Context refs
  const audioCtxRef = useRef(null);
  const humOscRef = useRef(null);
  const humGainRef = useRef(null);

  // Custom Audio refs map
  const customAudioRefs = useRef({});

  // Notes
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");

  // Flashcards Index
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load notes & custom streams on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("sis_warm_study_notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes([
        { id: 1, text: "Finish Pathology slides formatting 💻" },
        { id: 2, text: "Revise clinical posting logbook 🩺" },
        { id: 3, text: "Keep water bottle next to Robbins text! 🥤" }
      ]);
    }

    // Load custom persistent URL streams
    const savedCustomSounds = localStorage.getItem("sis_custom_sounds");
    if (savedCustomSounds) {
      const parsed = JSON.parse(savedCustomSounds).map(t => ({
        ...t,
        active: false,
        volume: 0.5
      }));
      setCustomTracks(parsed);
    }
  }, []);

  const saveNotes = (updated) => {
    setNotes(updated);
    localStorage.setItem("sis_warm_study_notes", JSON.stringify(updated));
  };

  const saveCustomSoundsToLocal = (updatedList) => {
    // Only persist online streams (local Object URLs expire on page refresh anyway)
    const toPersist = updatedList.filter(t => !t.isLocalFile).map(t => ({
      id: t.id,
      name: t.name,
      url: t.url
    }));
    localStorage.setItem("sis_custom_sounds", JSON.stringify(toPersist));
  };

  // Timer countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playCompletionAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === "study" ? 50 * 60 : 10 * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "study" ? 50 * 60 : 10 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progressPercentage = (timeLeft / (mode === "study" ? 50 * 60 : 10 * 60)) * 100;

  // Web Audio Context initialization
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Synthesize Ward Hum (low frequency low-pass sine hum)
  const startWardHum = () => {
    initAudioContext();
    try {
      const osc = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();
      const filter = audioCtxRef.current.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(65, audioCtxRef.current.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, audioCtxRef.current.currentTime);

      const targetVol = audioChannels.hum.volume * globalVolume * 0.05;
      gainNode.gain.setValueAtTime(targetVol, audioCtxRef.current.currentTime);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);

      osc.start();
      humOscRef.current = osc;
      humGainRef.current = gainNode;
    } catch (e) {
      console.error(e);
      setAudioError("Audio synthesis blocked or unsupported.");
    }
  };

  const stopWardHum = () => {
    if (humOscRef.current) {
      try {
        humOscRef.current.stop();
        humOscRef.current.disconnect();
      } catch (e) {}
      humOscRef.current = null;
    }
    humGainRef.current = null;
  };

  // Sound completion alert
  const playCompletionAlert = () => {
    initAudioContext();
    try {
      const now = audioCtxRef.current.currentTime;
      [329.63, 392.00, 523.25, 659.25].forEach((freq, idx) => {
        const osc = audioCtxRef.current.createOscillator();
        const gainNode = audioCtxRef.current.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gainNode.gain.setValueAtTime(0, now + idx * 0.12);
        gainNode.gain.linearRampToValueAtTime(0.08, now + idx * 0.12 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.5);
        osc.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.6);
      });
    } catch (e) {}
  };

  const toggleChannel = (channel) => {
    setAudioError("");
    const isActivating = !audioChannels[channel].active;

    setAudioChannels(prev => ({
      ...prev,
      [channel]: { ...prev[channel], active: isActivating }
    }));

    if (channel === "lofi") {
      if (isActivating) {
        lofiRef.current.volume = audioChannels.lofi.volume * globalVolume;
        lofiRef.current.play().catch(() => setAudioError("Autoplay blocked. Tap page first."));
      } else {
        lofiRef.current.pause();
      }
    } else if (channel === "rain") {
      if (isActivating) {
        rainRef.current.volume = audioChannels.rain.volume * globalVolume;
        rainRef.current.play().catch(() => setAudioError("Autoplay blocked. Tap page first."));
      } else {
        rainRef.current.pause();
      }
    } else if (channel === "cafe") {
      if (isActivating) {
        cafeRef.current.volume = audioChannels.cafe.volume * globalVolume;
        cafeRef.current.play().catch(() => setAudioError("Autoplay blocked. Tap page first."));
      } else {
        cafeRef.current.pause();
      }
    } else if (channel === "hum") {
      if (isActivating) {
        startWardHum();
      } else {
        stopWardHum();
      }
    }
  };

  const handleChannelVolume = (channel, val) => {
    setAudioChannels(prev => ({
      ...prev,
      [channel]: { ...prev[channel], volume: val }
    }));

    const computed = val * globalVolume;
    if (channel === "lofi" && lofiRef.current) lofiRef.current.volume = computed;
    if (channel === "rain" && rainRef.current) rainRef.current.volume = computed;
    if (channel === "cafe" && cafeRef.current) cafeRef.current.volume = computed;
    if (channel === "hum" && humGainRef.current && audioCtxRef.current) {
      humGainRef.current.gain.setValueAtTime(computed * 0.05, audioCtxRef.current.currentTime);
    }
  };

  // --- CUSTOM AUDIO TRACK HANDLERS ---
  const handleLocalAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setAudioFileError("Please upload a valid audio file (.mp3, .wav, etc.)");
      return;
    }

    setAudioFileError("");
    const url = URL.createObjectURL(file);
    const newTrack = {
      id: "custom_audio_" + Date.now(),
      name: file.name.replace(/\.[^/.]+$/, ""), // strip file extension
      url: url,
      volume: 0.5,
      active: false,
      isLocalFile: true
    };

    const updated = [...customTracks, newTrack];
    setCustomTracks(updated);
    setShowAddSoundForm(false);
  };

  const handleAddOnlineTrack = (e) => {
    e.preventDefault();
    if (!customTrackName.trim() || !customTrackUrl.trim()) return;

    setAudioFileError("");
    const newTrack = {
      id: "custom_audio_" + Date.now(),
      name: customTrackName.trim(),
      url: customTrackUrl.trim(),
      volume: 0.5,
      active: false,
      isLocalFile: false
    };

    const updated = [...customTracks, newTrack];
    setCustomTracks(updated);
    saveCustomSoundsToLocal(updated);

    // Reset Form
    setCustomTrackName("");
    setCustomTrackUrl("");
    setShowAddSoundForm(false);
  };

  const handleDeleteCustomTrack = (id) => {
    // stop playing first
    const audioNode = customAudioRefs.current[id];
    if (audioNode) {
      audioNode.pause();
    }

    const updated = customTracks.filter(t => t.id !== id);
    setCustomTracks(updated);
    saveCustomSoundsToLocal(updated);
  };

  const toggleCustomTrack = (id) => {
    setAudioError("");
    const updated = customTracks.map(t => {
      if (t.id === id) {
        const isActivating = !t.active;
        const audioNode = customAudioRefs.current[id];
        
        if (audioNode) {
          if (isActivating) {
            audioNode.volume = t.volume * globalVolume;
            audioNode.play().catch(() => setAudioError("Autoplay blocked. Tap page first."));
          } else {
            audioNode.pause();
          }
        }
        return { ...t, active: isActivating };
      }
      return t;
    });
    setCustomTracks(updated);
  };

  const handleCustomTrackVolume = (id, val) => {
    const updated = customTracks.map(t => {
      if (t.id === id) {
        const audioNode = customAudioRefs.current[id];
        if (audioNode) {
          audioNode.volume = val * globalVolume;
        }
        return { ...t, volume: val };
      }
      return t;
    });
    setCustomTracks(updated);
  };

  const handleGlobalVolume = (val) => {
    setGlobalVolume(val);
    
    // Default channels
    Object.keys(audioChannels).forEach((channel) => {
      const computed = audioChannels[channel].volume * val;
      if (channel === "lofi" && lofiRef.current && audioChannels.lofi.active) lofiRef.current.volume = computed;
      if (channel === "rain" && rainRef.current && audioChannels.rain.active) rainRef.current.volume = computed;
      if (channel === "cafe" && cafeRef.current && audioChannels.cafe.active) cafeRef.current.volume = computed;
      if (channel === "hum" && humGainRef.current && audioChannels.hum.active && audioCtxRef.current) {
        humGainRef.current.gain.setValueAtTime(computed * 0.05, audioCtxRef.current.currentTime);
      }
    });

    // Custom channels
    customTracks.forEach((t) => {
      const audioNode = customAudioRefs.current[t.id];
      if (audioNode && t.active) {
        audioNode.volume = t.volume * val;
      }
    });
  };

  useEffect(() => {
    const currentRefs = customAudioRefs.current;
    return () => {
      stopWardHum();
      // stop all custom audio playback on unmount
      Object.keys(currentRefs).forEach((key) => {
        if (currentRefs[key]) {
          try {
            currentRefs[key].pause();
          } catch(e) {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNotes = [...notes, { id: Date.now(), text: newNoteText.trim() }];
    saveNotes(newNotes);
    setNewNoteText("");
  };

  const deleteNote = (id) => {
    const filtered = notes.filter(n => n.id !== id);
    saveNotes(filtered);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 pb-16 items-start">
      
      {/* HTML5 audio tags for streams */}
      <audio ref={lofiRef} src={audioChannels.lofi.url} loop preload="auto" />
      <audio ref={rainRef} src={audioChannels.rain.url} loop preload="auto" />
      <audio ref={cafeRef} src={audioChannels.cafe.url} loop preload="auto" />

      {/* Custom Dynamic Audio elements */}
      {customTracks.map((t) => (
        <audio 
          key={t.id} 
          src={t.url} 
          ref={(el) => { customAudioRefs.current[t.id] = el; }} 
          loop 
          preload="auto" 
        />
      ))}

      {/* --- LEFT: POMODORO CLOCK & SOUND MIXER (Span 7) --- */}
      <div className="lg:col-span-7 flex flex-col gap-8 md:gap-10">
        
        {/* Large Pomodoro Panel */}
        <div className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-rose-50/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-[#F0EDE6]/80 pb-5 mb-6">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[var(--text-title)] uppercase flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[var(--color-accent)] animate-pulse" />
              MBBS study rotation clock
            </h2>

            <div className="flex bg-[#FAF8F6] p-1 rounded-2xl border border-[#F0EDE6] shadow-inner">
              <button
                onClick={() => switchMode("study")}
                className={`px-4.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                  mode === "study"
                    ? "bg-white text-[var(--color-accent)] shadow-sm border border-rose-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Study Session (50m)
              </button>
              <button
                onClick={() => switchMode("break")}
                className={`px-4.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                  mode === "break"
                    ? "bg-white text-[var(--color-secondary)] shadow-sm border border-emerald-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Break Time (10m)
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-8 md:my-10">
            <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                className="stroke-slate-100 fill-none"
                strokeWidth="7"
                style={{ transform: "translate(16px, 16px)" }}
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                className={`fill-none transition-all duration-500 ${
                  mode === "study" ? "stroke-[var(--color-accent)]" : "stroke-[var(--color-secondary)]"
                }`}
                strokeWidth="7"
                strokeDasharray="691"
                strokeDashoffset={691 - (691 * progressPercentage) / 100}
                strokeLinecap="round"
                style={{ transform: "translate(16px, 16px)" }}
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-6xl sm:text-7xl font-black tracking-tight text-[var(--text-title)] font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono font-bold mt-1.5 block">
                {mode === "study" ? "Deep Focus Posting" : "Breathing Break"}
              </span>
            </div>
          </div>

          <div className="flex gap-4 max-w-md mx-auto">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-4.5 rounded-2xl text-sm font-bold shadow-md transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10"
                  : mode === "study"
                  ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white hover:shadow-rose-500/10"
                  : "bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white hover:shadow-emerald-500/10"
              }`}
            >
              {isRunning ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current" />}
              <span>{isRunning ? "Pause Session" : "Start Session"}</span>
            </button>

            <button
              onClick={resetTimer}
              title="Reset timer"
              className="p-4.5 bg-[#FAF8F6] hover:bg-slate-100 border border-[#F0EDE6] text-[var(--text-title)] rounded-2xl transition duration-300 transform active:scale-95 shrink-0 shadow-sm"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Ambient Soundscape Mixer */}
        <div className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F0EDE6]/80 pb-5 mb-6">
              <h2 className="text-xs font-mono font-bold tracking-widest text-[var(--text-title)] flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[var(--color-accent)]" />
                Acoustic Noise Eraser
              </h2>
              
              <button
                onClick={() => setShowAddSoundForm(!showAddSoundForm)}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 text-[10px] font-bold text-[var(--color-accent)] rounded-xl flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddSoundForm ? "Close Menu" : "Add custom music"}</span>
              </button>
            </div>

            {audioError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 text-[var(--color-accent)] rounded-2xl text-xs">
                {audioError}
              </div>
            )}

            {/* Custom Sound Insertion Form */}
            <AnimatePresence>
              {showAddSoundForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-5 bg-[#FAF8F6] border border-[#F0EDE6] rounded-3xl space-y-4 overflow-hidden shadow-inner"
                >
                  <div className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wide border-b border-[#F0EDE6] pb-2">
                    Inject custom choice music channel
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tab A: Local File upload */}
                    <div className="p-4 bg-white border border-[#F0EDE6] rounded-2xl space-y-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Choice A: Select Local File</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">Load any MP3/WAV backing track from your local phone/laptop memory.</p>
                      </div>
                      
                      <label className="flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-50 hover:bg-rose-100/70 text-[var(--color-accent)] rounded-xl cursor-pointer text-xs font-bold transition mt-3">
                        <Upload className="w-4 h-4" />
                        <span>Select Audio File</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleLocalAudioUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Tab B: Online stream */}
                    <form onSubmit={handleAddOnlineTrack} className="p-4 bg-white border border-[#F0EDE6] rounded-2xl space-y-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Choice B: Paste Web URL</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">Provide a public streaming MP3 link. This choice persists forever.</p>
                      </div>
                      
                      <div className="space-y-1.5 mt-2">
                        <input
                          type="text"
                          placeholder="e.g. My Chill Beats"
                          value={customTrackName}
                          onChange={(e) => setCustomTrackName(e.target.value)}
                          className="w-full bg-[#FAF8F6] border border-[#F0EDE6] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                          required
                        />
                        <input
                          type="url"
                          placeholder="https://example.com/song.mp3"
                          value={customTrackUrl}
                          onChange={(e) => setCustomTrackUrl(e.target.value)}
                          className="w-full bg-[#FAF8F6] border border-[#F0EDE6] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                          required
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold rounded-xl transition"
                      >
                        Add URL Track
                      </button>
                    </form>
                  </div>

                  {audioFileError && <p className="text-xs text-rose-500 font-bold mt-1 text-center">{audioFileError}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sliders container */}
            <div className="space-y-5">
              
              {/* Rain */}
              <div className="bg-[#FAF8F6] p-4.5 rounded-3xl border border-[#F0EDE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => toggleChannel("rain")}
                  className={`px-4.5 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 flex items-center gap-2 shrink-0 ${
                    audioChannels.rain.active
                      ? "bg-rose-50 border-rose-200 text-[var(--color-accent)]"
                      : "bg-white border-transparent text-slate-400"
                  }`}
                >
                  {audioChannels.rain.active ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>Rain Loop 🌧️</span>
                </button>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    disabled={!audioChannels.rain.active}
                    value={audioChannels.rain.volume}
                    onChange={(e) => handleChannelVolume("rain", parseFloat(e.target.value))}
                    className="flex-1 h-1.5 rounded-full cursor-pointer accent-[var(--color-accent)] bg-slate-200 disabled:opacity-40"
                  />
                  <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                    {Math.round(audioChannels.rain.volume * 100)}%
                  </span>
                </div>
              </div>

              {/* Coffee Shop */}
              <div className="bg-[#FAF8F6] p-4.5 rounded-3xl border border-[#F0EDE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => toggleChannel("cafe")}
                  className={`px-4.5 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 flex items-center gap-2 shrink-0 ${
                    audioChannels.cafe.active
                      ? "bg-rose-50 border-rose-200 text-[var(--color-accent)]"
                      : "bg-white border-transparent text-slate-400"
                  }`}
                >
                  {audioChannels.cafe.active ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>Coffee Shop Ambiance ☕</span>
                </button>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    disabled={!audioChannels.cafe.active}
                    value={audioChannels.cafe.volume}
                    onChange={(e) => handleChannelVolume("cafe", parseFloat(e.target.value))}
                    className="flex-1 h-1.5 rounded-full cursor-pointer accent-[var(--color-accent)] bg-slate-200 disabled:opacity-40"
                  />
                  <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                    {Math.round(audioChannels.cafe.volume * 100)}%
                  </span>
                </div>
              </div>

              {/* Ward Hum */}
              <div className="bg-[#FAF8F6] p-4.5 rounded-3xl border border-[#F0EDE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => toggleChannel("hum")}
                  className={`px-4.5 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 flex items-center gap-2 shrink-0 ${
                    audioChannels.hum.active
                      ? "bg-rose-50 border-rose-200 text-[var(--color-accent)]"
                      : "bg-white border-transparent text-slate-400"
                  }`}
                >
                  {audioChannels.hum.active ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>Ward White Noise 🏥</span>
                </button>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    disabled={!audioChannels.hum.active}
                    value={audioChannels.hum.volume}
                    onChange={(e) => handleChannelVolume("hum", parseFloat(e.target.value))}
                    className="flex-1 h-1.5 rounded-full cursor-pointer accent-[var(--color-accent)] bg-slate-200 disabled:opacity-40"
                  />
                  <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                    {Math.round(audioChannels.hum.volume * 100)}%
                  </span>
                </div>
              </div>

              {/* Lo-Fi Study */}
              <div className="bg-[#FAF8F6] p-4.5 rounded-3xl border border-[#F0EDE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => toggleChannel("lofi")}
                  className={`px-4.5 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 flex items-center gap-2 shrink-0 ${
                    audioChannels.lofi.active
                      ? "bg-rose-50 border-rose-200 text-[var(--color-accent)]"
                      : "bg-white border-transparent text-slate-400"
                  }`}
                >
                  {audioChannels.lofi.active ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>Lo-Fi Beats 🎧</span>
                </button>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    disabled={!audioChannels.lofi.active}
                    value={audioChannels.lofi.volume}
                    onChange={(e) => handleChannelVolume("lofi", parseFloat(e.target.value))}
                    className="flex-1 h-1.5 rounded-full cursor-pointer accent-[var(--color-accent)] bg-slate-200 disabled:opacity-40"
                  />
                  <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                    {Math.round(audioChannels.lofi.volume * 100)}%
                  </span>
                </div>
              </div>

              {/* DYNAMICALLY RENDERED Didi's Custom Choice Music Tracks */}
              {customTracks.map((t) => (
                <div 
                  key={t.id} 
                  className="bg-[#FAF8F6] p-4.5 rounded-3xl border border-dashed border-rose-250 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleCustomTrack(t.id)}
                      className={`px-4 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                        t.active
                          ? "bg-rose-50 border-rose-200 text-[var(--color-accent)] animate-pulse"
                          : "bg-white border-transparent text-slate-450"
                      }`}
                    >
                      {t.active ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <span className="max-w-[130px] truncate">{t.name} {t.isLocalFile ? "📁" : "🌐"}</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCustomTrack(t.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                      title="Remove Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">Vol</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      disabled={!t.active}
                      value={t.volume}
                      onChange={(e) => handleCustomTrackVolume(t.id, parseFloat(e.target.value))}
                      className="flex-1 h-1.5 rounded-full cursor-pointer accent-[var(--color-accent)] bg-slate-200 disabled:opacity-40"
                    />
                    <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                      {Math.round(t.volume * 100)}%
                    </span>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Master Volume control */}
          <div className="mt-8 border-t border-[#F0EDE6]/80 pt-5 flex items-center justify-between gap-6 bg-[#FAF8F6] p-4.5 rounded-3xl border border-[#F0EDE6] shadow-inner">
            <span className="text-xs font-bold text-[var(--text-title)] font-mono uppercase">Master Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={globalVolume}
              onChange={(e) => handleGlobalVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-full cursor-pointer accent-rose-500 bg-slate-200"
            />
            <span className="text-xs font-bold font-mono text-[var(--text-title)] w-10 text-right">
              {Math.round(globalVolume * 100)}%
            </span>
          </div>
        </div>

      </div>

      {/* --- RIGHT: FLASHCARDS & PASTEL STICKIES (Span 5) --- */}
      <div className="lg:col-span-5 flex flex-col gap-8 md:gap-10">
        
        {/* Revision Flashcards Card */}
        <div className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-7 shadow-sm relative">
          <div className="flex items-center justify-between border-b border-[#F0EDE6]/60 pb-4 mb-4">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[var(--text-title)] flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-[var(--color-accent)]" />
              MBBS mnemonic card deck
            </h2>
            <span className="text-[10px] font-mono text-slate-450">
              {activeCardIdx + 1} / {MNEMONICS.length}
            </span>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-52 perspective-1000 cursor-pointer relative"
          >
            <div className={`w-full h-full duration-500 transform-style-3d relative transition-transform ${isFlipped ? "rotate-y-180" : ""}`}>
              
              {/* Front side */}
              <div className="absolute w-full h-full backface-hidden bg-[#FAF8F6] border border-[#F0EDE6] rounded-3xl p-6.5 flex flex-col justify-between items-center text-center shadow-inner">
                <span className="text-[10.5px] font-bold text-[var(--color-accent)] uppercase tracking-wider font-mono">
                  {MNEMONICS[activeCardIdx].subject}
                </span>
                <p className="text-base sm:text-lg text-[var(--text-title)] font-extrabold leading-snug px-3">
                  {MNEMONICS[activeCardIdx].front}
                </p>
                <span className="text-[9px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                  TAP CARD TO FLIP 🔄
                </span>
              </div>

              {/* Back side */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#FAF8F6] border border-[#F0EDE6] rounded-3xl p-6.5 flex flex-col justify-between items-center text-center shadow-inner overflow-y-auto">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Mnemonic Answer
                </span>
                <p className="text-sm sm:text-base text-[var(--text-main)] font-semibold leading-relaxed px-1 my-2">
                  {MNEMONICS[activeCardIdx].back}
                </p>
                <span className="text-[8.5px] font-mono text-slate-400">
                  TAP CARD TO RETURN
                </span>
              </div>

            </div>
          </div>

          {/* Flashcard controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setTimeout(() => {
                  setActiveCardIdx(prev => (prev - 1 + MNEMONICS.length) % MNEMONICS.length);
                }, 150);
              }}
              className="py-2 px-3 rounded-xl bg-[#FAF8F6] border border-[#F0EDE6] text-xs font-bold text-slate-500 hover:text-[var(--color-accent)] hover:bg-slate-100 transition active:scale-95"
            >
              Previous
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setTimeout(() => {
                  setActiveCardIdx(prev => (prev + 1) % MNEMONICS.length);
                }, 150);
              }}
              className="py-2 px-3 rounded-xl bg-[#FAF8F6] border border-[#F0EDE6] text-xs font-bold text-slate-500 hover:text-[var(--color-accent)] hover:bg-slate-100 transition active:scale-95"
            >
              Next
            </button>
          </div>
        </div>

        {/* Pastel Yellow, Pink, Green Sticky Notes Wall */}
        <div className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-7 shadow-sm">
          <h2 className="text-sm font-mono font-bold tracking-widest text-[var(--text-title)] flex items-center gap-2 border-b border-[#F0EDE6]/60 pb-4 mb-4 uppercase">
            <span>📌</span>
            Didi&apos;s Sticky Pinboard
          </h2>

          {/* Note Stack */}
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {notes.length > 0 ? (
              notes.map((note, index) => {
                // Alternating sticky pastel colors
                const stickyColors = [
                  "bg-amber-50/75 border-amber-100 text-amber-900",
                  "bg-rose-50/75 border-rose-100 text-rose-900",
                  "bg-emerald-50/75 border-emerald-100 text-emerald-950"
                ];
                const colorClass = stickyColors[index % stickyColors.length];

                return (
                  <div
                    key={note.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-sm transition hover:scale-[1.01] ${colorClass}`}
                  >
                    <p className="handwriting text-lg sm:text-xl text-[var(--text-title)] flex-1 pt-0.5 leading-snug font-bold">
                      {note.text}
                    </p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 hover:text-rose-600 text-slate-400 transition opacity-60 hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed border-[#F0EDE6] rounded-2xl bg-[#FAF8F6]">
                <p className="text-sm text-slate-400 font-mono">No pinned sticky notes. Add one below!</p>
              </div>
            )}
          </div>

          {/* Form to add note */}
          <form onSubmit={addNote} className="mt-5 flex gap-2 pt-3 border-t border-[#F0EDE6]/80">
            <input
              type="text"
              placeholder="Pin a custom clinical posting goal..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-1 bg-[#FAF8F6] border border-[#F0EDE6] rounded-xl px-4 py-2.5 text-sm text-[var(--text-title)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-accent)] transition shadow-inner"
              maxLength={100}
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-xl text-sm font-bold transition active:scale-95 flex items-center justify-center shrink-0"
            >
              Add Sticky
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
