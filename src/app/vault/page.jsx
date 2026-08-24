"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Calendar,
  MailOpen,
  Mail,
  Music,
  FolderOpen,
  ExternalLink,
  Plus,
  Trash2,
  Send,
  Upload,
  Edit3,
  X,
} from "lucide-react";
import { CONFIG } from "../../config";

export default function MemoryVault() {
  const [memories, setMemories] = useState([]);
  const [letterOpen, setLetterOpen] = useState(false);
  const [isPlayingChime, setIsPlayingChime] = useState(false);

  // Custom Memory Form states
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [newMemTitle, setNewMemTitle] = useState("");
  const [newMemDate, setNewMemDate] = useState("");

  // Image Upload state
  const [uploadedImage, setUploadedImage] = useState("");
  const [imageError, setImageError] = useState("");

  // Edit Card Override states
  const [editingMemory, setEditingMemory] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  // Failed image loader tracking and active try state
  const [failedImages, setFailedImages] = useState({});
  const [triedExtensions, setTriedExtensions] = useState({});

  // Lightbox Zoom View State
  const [selectedImage, setSelectedImage] = useState(null);

  // Postcard Reply States
  const [letterReply, setLetterReply] = useState("");
  const [savedReply, setSavedReply] = useState("");

  const audioCtxRef = useRef(null);

  // Sync / load memories including overrides & custom items
  const reloadMemories = () => {
    const savedOverrides = localStorage.getItem("sis_memory_overrides");
    const overrides = savedOverrides ? JSON.parse(savedOverrides) : {};

    const savedCustom = localStorage.getItem("sis_custom_memories");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];

    const allMems = [...CONFIG.memories, ...customList].map((m) => {
      // Apply card text overrides if she customized them in the UI
      if (overrides[m.id]) {
        return {
          ...m,
          title: overrides[m.id].title ?? m.title,
          date: overrides[m.id].date ?? m.date,
        };
      }
      return m;
    });

    setMemories(allMems);
  };

  useEffect(() => {
    reloadMemories();

    // Load letter reply
    const reply = localStorage.getItem("sis_letter_reply") || "";
    setLetterReply(reply);
    setSavedReply(reply);
  }, []);

  const saveMemoriesToLocal = (updatedCustomList) => {
    localStorage.setItem(
      "sis_custom_memories",
      JSON.stringify(updatedCustomList),
    );
  };

  // Handle client-side image compression
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please upload a valid image file.");
      return;
    }

    setImageError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;

      // Canvas compression to avoid localStorage storage quota limit
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 500; // Perfect bounding box size for Polaroid resolution

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to highly optimized JPEG (70% quality factor)
        const compressedUrl = canvas.toDataURL("image/jpeg", 0.7);
        setUploadedImage(compressedUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newMemTitle.trim()) return;

    const dateStamp = newMemDate.trim() || "KMMCH Posting Period";
    const customItem = {
      id: "custom_memory_" + Date.now(),
      title: newMemTitle.trim(),
      image: uploadedImage, // Base64 data URL
      date: dateStamp,
      isCustom: true,
    };

    const savedCustom = localStorage.getItem("sis_custom_memories");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedCustom = [...customList, customItem];

    saveMemoriesToLocal(updatedCustom);
    reloadMemories();

    // Reset Form
    setNewMemTitle("");
    setNewMemDate("");
    setUploadedImage("");
    setShowMemoryForm(false);
  };

  const handleDeleteMemory = (id) => {
    const savedCustom = localStorage.getItem("sis_custom_memories");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedCustom = customList.filter((m) => m.id !== id);

    saveMemoriesToLocal(updatedCustom);
    reloadMemories();
  };

  const handleOpenEdit = (photo) => {
    setEditingMemory(photo);
    setEditTitle(photo.title);
    setEditDate(photo.date);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMemory) return;

    if (editingMemory.isCustom) {
      // Update custom memories array
      const savedCustom = localStorage.getItem("sis_custom_memories");
      const customList = savedCustom ? JSON.parse(savedCustom) : [];
      const updatedCustom = customList.map((m) => {
        if (m.id === editingMemory.id) {
          return {
            ...m,
            title: editTitle.trim(),
            date: editDate.trim(),
          };
        }
        return m;
      });
      saveMemoriesToLocal(updatedCustom);
    } else {
      // Save overrides for preloaded photo slots
      const savedOverrides = localStorage.getItem("sis_memory_overrides");
      const overrides = savedOverrides ? JSON.parse(savedOverrides) : {};
      overrides[editingMemory.id] = {
        title: editTitle.trim(),
        date: editDate.trim(),
      };
      localStorage.setItem("sis_memory_overrides", JSON.stringify(overrides));
    }

    reloadMemories();
    setEditingMemory(null);
  };

  // Safe file resolver that loops through .jpg and .jpeg for sequentially ordered slots: photo1, photo2, photo3...
  const getPhotoSrc = (photo) => {
    if (photo.isCustom) return photo.image;

    const slotIndex = parseInt(photo.id.replace("preload_mem_", ""), 10) - 1;
    const filename = "photo" + (slotIndex + 1);
    const triedState = triedExtensions[photo.id];

    if (triedState === "jpeg") {
      return `/memories/${filename}.jpeg`;
    }
    return `/memories/${filename}.jpg`;
  };

  const handleImageError = (photo) => {
    if (photo.isPreloaded) {
      const triedState = triedExtensions[photo.id];
      if (!triedState) {
        // Fallback to try .jpeg extension
        setTriedExtensions((prev) => ({ ...prev, [photo.id]: "jpeg" }));
      } else {
        // Hide card if both .jpg and .jpeg fail
        setFailedImages((prev) => ({ ...prev, [photo.id]: true }));
      }
    }
  };

  const handleSaveReply = () => {
    localStorage.setItem("sis_letter_reply", letterReply);
    setSavedReply(letterReply);
  };

  const handleSendReplyWhatsApp = () => {
    if (!letterReply.trim()) return;
    const cleanPhone = CONFIG.brotherWhatsApp.replace(/\D/g, "");
    const messageText = `Hey Bhai! I read your capsule letter on the dashboard and wanted to reply:\n\n"${letterReply.trim()}"`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, "_blank");
  };

  // Play family cheer chime using Web Audio API synthesis (chiptune style)
  const playFamilyChime = () => {
    if (isPlayingChime) return;
    setIsPlayingChime(true);

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const now = audioCtxRef.current.currentTime;
      const melody = [
        { note: 523.25, duration: 0.15 },
        { note: 659.25, duration: 0.15 },
        { note: 783.99, duration: 0.15 },
        { note: 1046.5, duration: 0.4 },
      ];

      let elapsed = 0;
      melody.forEach((item) => {
        const osc = audioCtxRef.current.createOscillator();
        const gainNode = audioCtxRef.current.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(item.note, now + elapsed);

        gainNode.gain.setValueAtTime(0, now + elapsed);
        gainNode.gain.linearRampToValueAtTime(0.12, now + elapsed + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          now + elapsed + item.duration - 0.02,
        );

        osc.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);

        osc.start(now + elapsed);
        osc.stop(now + elapsed + item.duration);

        elapsed += item.duration - 0.03;
      });

      setTimeout(
        () => {
          setIsPlayingChime(false);
        },
        elapsed * 1000 + 400,
      );
    } catch (e) {
      console.error(e);
      setIsPlayingChime(false);
    }
  };

  // Filter memories to hide preloaded slots that do not have active image files in public/memories/
  const visibleMemories = memories.filter((photo) => {
    if (photo.isPreloaded && failedImages[photo.id]) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10 pb-16">
      {/* Header section with Drive album launcher */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border border-[#F0EDE6] p-7 rounded-[2rem] shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-title)] flex items-center gap-2">
            <Camera className="w-6 h-6 text-[var(--color-accent)] animate-pulse" />
            Childhood Archives & Family Vault
          </h2>
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={() => setShowMemoryForm(!showMemoryForm)}
            className="py-3 px-5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[var(--color-accent)] rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition duration-300 transform active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{showMemoryForm ? "Close Form" : "Log Memory & Photo"}</span>
          </button>

          <a
            href={CONFIG.driveAlbumUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-6 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition duration-300 transform active:scale-95 flex items-center gap-2 border border-emerald-500/10"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Google Drive Album</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Add Custom Memory Form (With client-side image compression) */}
      <AnimatePresence>
        {showMemoryForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMemory}
            className="w-full p-6 sm:p-8 bg-white border border-[#F0EDE6] rounded-[2rem] space-y-5 overflow-hidden shadow-sm"
          >
            <div className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wide border-b border-[#F0EDE6] pb-2">
              Log Custom Sibling/College Memory Card
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  Memory Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. KMMCH Anatomy Viva Survival"
                  value={newMemTitle}
                  onChange={(e) => setNewMemTitle(e.target.value)}
                  className="w-full bg-[#FAF8F6] border border-[#F0EDE6] rounded-xl px-3 py-2.5 text-sm text-[var(--text-title)] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  Date / Period stamp
                </label>
                <input
                  type="text"
                  placeholder="e.g. October 2025 / 2nd Prof"
                  value={newMemDate}
                  onChange={(e) => setNewMemDate(e.target.value)}
                  className="w-full bg-[#FAF8F6] border border-[#F0EDE6] rounded-xl px-3 py-2.5 text-sm text-[var(--text-title)] focus:outline-none"
                />
              </div>

              {/* Local File Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                  Upload Memory Photo
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#FAF8F6] hover:bg-slate-100 border border-[#F0EDE6] rounded-xl cursor-pointer text-xs font-semibold text-slate-600 transition">
                    <Upload className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>
                      {uploadedImage ? "Photo Loaded ✓" : "Choose File"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {uploadedImage && (
                    <button
                      type="button"
                      onClick={() => setUploadedImage("")}
                      className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl border border-rose-200 transition text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {imageError && (
                  <p className="text-[10px] text-rose-500 mt-1 font-semibold">
                    {imageError}
                  </p>
                )}
              </div>
            </div>

            {/* Upload preview */}
            {uploadedImage && (
              <div className="p-3 bg-[#FAF8F6] border border-[#F0EDE6] rounded-2xl flex items-center gap-4">
                <div className="w-16 h-12 rounded overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={uploadedImage}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Photo compressed and ready to store in LocalStorage.
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition active:scale-95"
            >
              Pin Memory Card to Board
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid of Polaroid Cards */}
      {visibleMemories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {visibleMemories.map((photo, index) => {
            const tiltDegrees =
              index % 3 === 0 ? -1.5 : index % 3 === 1 ? 2 : -0.8;

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-7 shadow-sm flex flex-col justify-between relative group"
              >
                {/* Control bar */}
                <div className="absolute top-4 right-4 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition duration-300">
                  {/* Edit metadata info overrides button */}
                  <button
                    onClick={() => handleOpenEdit(photo)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition border border-slate-200"
                    title="Edit Card Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Custom Memory option */}
                  {photo.isCustom && (
                    <button
                      onClick={() => handleDeleteMemory(photo.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                      title="Remove Memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Polaroid Frame */}
                <div
                  className="polaroid-frame w-full bg-white border border-slate-200/50 p-4 pb-8 flex flex-col items-center rounded-lg shadow-sm relative"
                  style={{ transform: `rotate(${tiltDegrees}deg)` }}
                >
                  {/* Photo frame container (Clickable to trigger Lightbox zoom) */}
                  <div
                    onClick={() =>
                      setSelectedImage({
                        src: getPhotoSrc(photo),
                        title: photo.title,
                      })
                    }
                    className="w-full aspect-[4/3] bg-rose-50/20 overflow-hidden rounded border border-slate-100/50 relative flex items-center justify-center cursor-zoom-in hover:opacity-95 transition-all duration-300"
                  >
                    <img
                      src={getPhotoSrc(photo)}
                      alt={photo.title}
                      className="w-full h-full object-cover filter contrast-[1.01] brightness-[0.99] hover:scale-105 transition-transform duration-500"
                      onError={() => handleImageError(photo)}
                    />
                  </div>

                  {/* Date stamp */}
                  <div className="mt-4 text-slate-700 font-mono text-[10.5px] text-center font-bold tracking-wider uppercase flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>{photo.date}</span>
                  </div>

                  {/* Title card inside Polaroid frame */}
                  <div className="text-center">
                    <span className="text-xs font-mono font-black text-slate-800 tracking-wide block truncate max-w-[200px] uppercase">
                      {photo.title}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-[#F0EDE6] rounded-[2.5rem] flex flex-col items-center justify-center p-8">
          <div className="p-4.5 bg-rose-50 rounded-full border border-rose-100 mb-4 text-[var(--color-accent)]">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-[var(--text-title)] mb-1">
            Your Archives board is empty
          </h3>
          <p className="text-xs sm:text-sm text-slate-455 leading-relaxed max-w-sm mb-6">
            Log custom memories directly on the screen using the form above, or
            drop files named `photo.jpg`, `photo1.jpeg`, `photo2.jpeg`... into
            your `public/memories/` folder to pre-load them!
          </p>
          <button
            onClick={() => setShowMemoryForm(true)}
            className="px-5 py-2.5 bg-[var(--color-accent)] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[var(--color-accent-hover)] transition"
          >
            Log First Memory
          </button>
        </div>
      )}

      {/* --- TIME CAPSULE OVERRIDES EDIT MODAL --- */}
      <AnimatePresence>
        {editingMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMemory(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSaveEdit}
              className="bg-white border border-[#F0EDE6] max-w-md w-full p-6 sm:p-8 rounded-[2rem] shadow-2xl relative z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#F0EDE6] pb-3">
                <span className="text-xs font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">
                  Edit Memory Card Details
                </span>
                <button type="button" onClick={() => setEditingMemory(null)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                    Memory Card Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#FAF8F6] border border-[#F0EDE6] rounded-xl px-3 py-2 text-sm text-[var(--text-title)] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                    Date / Period stamp
                  </label>
                  <input
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-[#FAF8F6] border border-[#F0EDE6] rounded-xl px-3 py-2 text-sm text-[var(--text-title)] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMemory(null)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* --- IMAGE LIGHTBOX FULLSCREEN ZOOM VIEW MODAL --- */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md cursor-zoom-out"
            />

            {/* Lightbox chassis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative z-10 max-w-4xl w-full flex flex-col items-center gap-4 text-center select-none"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 sm:-top-10 sm:-right-2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition shadow-md border border-white/10"
                title="Close Zoom"
              >
                <X className="w-5 h-5" />
              </button>

              {/* High-res image display (contain prevents cropping) */}
              <div className="w-full bg-[#FAF8F6]/5 rounded-3xl border border-white/10 p-2 overflow-hidden flex items-center justify-center shadow-2xl relative max-h-[75vh]">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-full max-h-[70vh] object-contain rounded-2xl"
                />
              </div>

              {/* Details card below image */}
              <div className="bg-white/95 backdrop-blur border border-[#F0EDE6] rounded-2xl px-6 py-3 shadow-xl w-fit">
                <h3 className="text-sm sm:text-base font-black text-[var(--text-title)]">
                  {selectedImage.title}
                </h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Time Capsule & Synthesizer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 w-full items-stretch">
        {/* Offline Sound Synthesis Card */}
        <div className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between text-center items-center">
          <div className="w-full">
            <span className="text-[10px] font-mono font-bold text-[var(--color-secondary)] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit mx-auto block mb-3">
              🔊 Local Synthesizer
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-title)] mb-2">
              Family Cheer Chime
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-main)] max-w-sm mx-auto leading-relaxed">
              When study motivation drops, click to synthesize a retro arpeggio
              chiptune. Runs completely local via oscillators!
            </p>
          </div>

          <div className="my-6">
            <motion.div
              animate={{
                scale: isPlayingChime ? [1, 1.15, 0.95, 1.05, 1] : 1,
                rotate: isPlayingChime ? [0, 8, -8, 8, 0] : 0,
              }}
              className="p-5 bg-emerald-50 rounded-full border border-emerald-100 text-[var(--color-secondary)] shadow-sm"
            >
              <Music className="w-10 h-10" />
            </motion.div>
          </div>

          <button
            onClick={playFamilyChime}
            className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition duration-300 transform active:scale-95 flex items-center justify-center gap-2 ${
              isPlayingChime
                ? "bg-slate-100 text-slate-400 border border-slate-200"
                : "bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white hover:shadow-emerald-500/10"
            }`}
            disabled={isPlayingChime}
          >
            {isPlayingChime ? "Chime Playing..." : "Play Family Cheer Chime 🕹️"}
          </button>
        </div>

        {/* Digital Time Capsule Letter Envelope */}
        <div className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <span className="text-[10px] font-mono font-bold text-[var(--color-accent)] uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100 w-fit mx-auto block mb-3">
              ✉️ Locked Letter
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-title)] mb-2">
              A Letter From Lucknow
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-main)] max-w-sm mx-auto leading-relaxed">
              An unfolding digital postcard sealed under sibling support
              protocol. Click to read and reply.
            </p>
          </div>

          <div
            className="my-6 cursor-pointer"
            onClick={() => setLetterOpen(true)}
          >
            {letterOpen ? (
              <MailOpen className="w-14 h-14 text-[var(--color-accent)]" />
            ) : (
              <Mail className="w-14 h-14 text-[var(--color-accent-light)] animate-pulse" />
            )}
          </div>

          <button
            onClick={() => setLetterOpen(true)}
            className="w-full py-4 bg-[#FAF8F6] hover:bg-slate-100 border border-[#F0EDE6] text-[var(--color-accent)] rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition duration-300 transform active:scale-95"
          >
            {letterOpen ? "Read Open Postcard" : "Open Digital Envelope"}
          </button>
        </div>
      </div>

      {/* --- TIME CAPSULE LETTER POSTCARD MODAL (Caveat Handwriting Font) --- */}
      <AnimatePresence>
        {letterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLetterOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Postcard Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#FAF8F6] border-2 border-[#F0EDE6] max-w-2xl w-full max-h-[90vh] p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative z-10 overflow-y-auto flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#F0EDE6] pb-4 mb-4">
                  <span className="text-[10px] font-mono font-bold text-[var(--color-accent)] uppercase tracking-widest bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
                    Postcard Sync Lock
                  </span>
                  <button
                    onClick={() => setLetterOpen(false)}
                    className="text-xs font-mono font-bold text-slate-400 hover:text-[var(--color-accent)] transition"
                  >
                    CLOSE [ESC]
                  </button>
                </div>

                {/* The postcard content using Caveat handwriting font */}
                <div className="space-y-5 text-[var(--text-title)] leading-relaxed font-normal bg-white p-6 rounded-3xl border border-[#F0EDE6] shadow-inner mb-5">
                  <p className="font-bold text-[var(--color-accent)] text-xl sm:text-2xl handwriting">
                    Dear Didi,
                  </p>

                  <p className="handwriting text-slate-800 text-lg">
                    I hope you are doing amazing, keeping yourself hydrated (or
                    coffeed ☕) and coping with the endless MBBS syllabus. I
                    know living away from home, managing Krishna Mohan Medical
                    hostel chores, attending night postings, and prepping for
                    viva examinations is incredibly draining. I want you to know
                    how proud I am of you.
                  </p>
                  <p className="handwriting text-slate-800 text-lg">
                    Whenever clinical posting vivas feel overwhelming, just take
                    a deep breath. One bad answer or a tough grader doesn&apos;t
                    reflect your ability to save lives down the line.
                    You&apos;re going to make an incredible doctor!
                  </p>
                  <p className="handwriting text-slate-800 text-lg">
                    I built this portal so you always have a piece of sibling
                    support on-call. If you need lo-fi study loops to lock out
                    hostel noise, or if you run out of energy and need an
                    emergency snack treat, just hit the **Brothers Hotline** and
                    I will sponsor the snacks immediately!
                  </p>
                  <p className="handwriting text-slate-800 text-lg">
                    Keep pushing forward, study hard, take plenty of rest, and
                    stop diagnosing yourself with rare autoimmune conditions
                    from Robbins!
                  </p>

                  <div className="pt-4 border-t border-[#F0EDE6] mt-4">
                    <p className="text-xs text-slate-400 font-mono">
                      With loads of love and respect,
                    </p>
                    <p className="text-3xl sm:text-4xl text-[var(--color-accent)] mt-2 font-bold leading-tight rotate-[-1.5deg] handwriting">
                      Krish and Harsh ❤️
                    </p>
                  </div>
                </div>

                {/* --- DIDI'S POSTCARD REPLY COMPONENT --- */}
                <div className="p-5 bg-emerald-50/50 border border-emerald-250 rounded-3xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10.5px] font-mono font-bold text-[var(--color-secondary)] uppercase tracking-wider">
                      📝 Reply to Bhai (Didi&apos;s choice)
                    </span>
                    {savedReply && (
                      <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded">
                        ✓ Saved & Synced
                      </span>
                    )}
                  </div>

                  <textarea
                    placeholder="Write your handwritten postcard response to Bhaiya here..."
                    value={letterReply}
                    onChange={(e) => setLetterReply(e.target.value)}
                    className="w-full bg-white border border-[#F0EDE6] rounded-2xl p-4.5 text-lg handwriting text-slate-800 focus:outline-none focus:border-[var(--color-secondary)] transition h-28 shadow-inner"
                  />

                  <div className="flex flex-col sm:flex-row gap-2 mt-3 justify-end">
                    <button
                      onClick={handleSaveReply}
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold rounded-xl transition active:scale-95 shadow-sm text-center"
                    >
                      Save & Sync Reply
                    </button>

                    <button
                      onClick={handleSendReplyWhatsApp}
                      disabled={!letterReply.trim()}
                      className="px-4 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white text-xs sm:text-sm font-bold rounded-xl transition active:scale-95 disabled:opacity-40 shadow-sm flex items-center justify-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setLetterOpen(false)}
                  className="w-full py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition active:scale-95 text-center"
                >
                  Return to Vault
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
