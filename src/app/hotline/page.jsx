"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Send, Coffee, ShieldAlert, Sparkles, CheckCircle, Plus, Trash2 } from "lucide-react";
import { CONFIG } from "../../config";

const STATIC_PRESETS = [
  {
    id: "snacks",
    label: "Send Emergency Study Snacks 🍔",
    category: "Food Dispatch",
    description: "Sponsor Zomato/Swiggy treat delivery directly to Krishna Mohan Medical Hostel.",
    message: "Hey Bhai! Study session is going long and my energy levels are hitting rock bottom. Can you please sponsor some emergency Zomato/Swiggy study snacks? 🍩🍔"
  },
  {
    id: "vent",
    label: "Need to Vent about Postings 📞",
    category: "Mental Support",
    description: "Request a quick 10-minute calling slot to rant about postings.",
    message: "Hey Bhai, vivas and posting schedules are getting too stressful. Do you have 10 minutes for a quick phone call? Need to vent and recharge! 📞"
  },
  {
    id: "visit",
    label: "Plan Next Home Visit 🚆",
    category: "Travel Sync",
    description: "Plan travel routes and schedule station pickups back to Lucknow.",
    message: "Hey! Let's coordinate and plan my next home visit train tickets back to Lucknow! 🚆 sync schedules!"
  }
];

const STATIC_COUPONS = [
  {
    id: "c1",
    title: "🍔 Free late-night Zomato Treat",
    description: "Valid for midnight coffee/desserts. Sibling-funded.",
    message: "Bhai! I am redeeming my digital coupon: '1 Free Late-Night Zomato Treat to Hostel'! Please check your GPay/Zomato 🍩🍔",
    revealed: false,
    redeemed: false
  },
  {
    id: "c2",
    title: "🚗 1 Free Ride from Station",
    description: "Pick up from station back home upon home visit.",
    message: "Travel Sync Alert! I am claiming my '1 Free Ride from Station' coupon. Pick me up from the station when I arrive in Lucknow! 🚆🚗",
    revealed: false,
    redeemed: false
  },
  {
    id: "c3",
    title: "🤫 Exemption from Sibling Arguments",
    description: "Bhaiya must agree with whatever you say for 24 hours.",
    message: "Claiming my 'Sibling Arguments Exemption' voucher! You must agree with whatever I say for the next 24 hours! 🤫",
    revealed: false,
    redeemed: false
  },
  {
    id: "c4",
    title: "💻 PPT Slides Formatting Help",
    description: "B.Tech tech support to format presentation slides.",
    message: "PPT Emergency! I am claiming my 'Slides Formatting Help' coupon. Need you to format my clinical postings presentation slides! 🖥️",
    revealed: false,
    redeemed: false
  }
];

export default function SiblingHotline() {
  const [presets, setPresets] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Form states for custom preset
  const [newPresetTitle, setNewPresetTitle] = useState("");
  const [newPresetCategory, setNewPresetCategory] = useState("");
  const [newPresetMessage, setNewPresetMessage] = useState("");
  const [showPresetForm, setShowPresetForm] = useState(false);

  // Form states for custom coupon
  const [newCouponTitle, setNewCouponTitle] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [newCouponMsg, setNewCouponMsg] = useState("");
  const [showCouponForm, setShowCouponForm] = useState(false);

  useEffect(() => {
    // Load presets
    const savedCustomPresets = localStorage.getItem("sis_custom_presets");
    const customList = savedCustomPresets ? JSON.parse(savedCustomPresets) : [];
    setPresets([...STATIC_PRESETS, ...customList]);

    // Load coupons
    const savedCoupons = localStorage.getItem("sis_scratch_coupons_v3");
    if (savedCoupons) {
      setCoupons(JSON.parse(savedCoupons));
    } else {
      setCoupons(STATIC_COUPONS);
    }
  }, []);

  const savePresetsToLocal = (updatedCustomList) => {
    localStorage.setItem("sis_custom_presets", JSON.stringify(updatedCustomList));
  };

  const saveCouponsToLocal = (updatedCoupons) => {
    setCoupons(updatedCoupons);
    localStorage.setItem("sis_scratch_coupons_v3", JSON.stringify(updatedCoupons));
  };

  // Add Custom Preset
  const handleAddPreset = (e) => {
    e.preventDefault();
    if (!newPresetTitle.trim() || !newPresetMessage.trim()) return;

    const category = newPresetCategory.trim() || "Custom Request";
    const customItem = {
      id: "custom_preset_" + Date.now(),
      label: newPresetTitle.trim(),
      category: category,
      description: "Custom choice added by Didi.",
      message: newPresetMessage.trim(),
      isCustom: true
    };

    const savedCustomPresets = localStorage.getItem("sis_custom_presets");
    const customList = savedCustomPresets ? JSON.parse(savedCustomPresets) : [];
    const updatedCustom = [...customList, customItem];
    
    savePresetsToLocal(updatedCustom);
    setPresets([...STATIC_PRESETS, ...updatedCustom]);

    // Reset Form
    setNewPresetTitle("");
    setNewPresetCategory("");
    setNewPresetMessage("");
    setShowPresetForm(false);
  };

  // Delete Custom Preset
  const handleDeletePreset = (id) => {
    const savedCustomPresets = localStorage.getItem("sis_custom_presets");
    const customList = savedCustomPresets ? JSON.parse(savedCustomPresets) : [];
    const updatedCustom = customList.filter(p => p.id !== id);

    savePresetsToLocal(updatedCustom);
    setPresets([...STATIC_PRESETS, ...updatedCustom]);
  };

  // Add Custom Coupon
  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponTitle.trim() || !newCouponMsg.trim()) return;

    const desc = newCouponDesc.trim() || "Custom favor voucher. Sibling-funded.";
    const customCouponItem = {
      id: "custom_coupon_" + Date.now(),
      title: newCouponTitle.trim(),
      description: desc,
      message: newCouponMsg.trim(),
      revealed: false,
      redeemed: false,
      isCustom: true
    };

    const updatedCoupons = [...coupons, customCouponItem];
    saveCouponsToLocal(updatedCoupons);

    // Reset Form
    setNewCouponTitle("");
    setNewCouponDesc("");
    setNewCouponMsg("");
    setShowCouponForm(false);
  };

  // Delete Custom Coupon
  const handleDeleteCoupon = (id) => {
    const updatedCoupons = coupons.filter(c => c.id !== id);
    saveCouponsToLocal(updatedCoupons);
  };

  // Scratch Coupon
  const scratchCoupon = (id) => {
    const updated = coupons.map(c => {
      if (c.id === id && !c.revealed) {
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
          colors: ["#E11D48", "#FDA4AF", "#FAF8F6"]
        });
        return { ...c, revealed: true };
      }
      return c;
    });
    saveCouponsToLocal(updated);
  };

  // Redeem Coupon
  const redeemCoupon = (id, message) => {
    const updated = coupons.map(c => {
      if (c.id === id && !c.redeemed) {
        return { ...c, redeemed: true };
      }
      return c;
    });
    saveCouponsToLocal(updated);

    const cleanPhone = CONFIG.brotherWhatsApp.replace(/\D/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const resetAllCoupons = () => {
    // Keep custom ones but reset status, or load static coupons
    const resetList = coupons.map(c => ({ ...c, revealed: false, redeemed: false }));
    saveCouponsToLocal(resetList);
  };

  const dispatchWhatsApp = (message) => {
    const cleanPhone = CONFIG.brotherWhatsApp.replace(/\D/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 pb-16 items-start">
      
      {/* --- WHATSAPP DISPATCH PRESETS (Span 6, Expanded layout) --- */}
      <div className="lg:col-span-6 flex flex-col gap-8">
        <div className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F0EDE6]/80 pb-5 mb-6">
            <div>
              <h2 className="text-xs font-mono font-bold tracking-widest text-[var(--text-title)] uppercase flex items-center gap-2">
                <span>📞</span>
                Hotline Treatment presets
              </h2>
              <p className="text-xs text-[var(--text-main)] font-semibold opacity-75 mt-1 leading-relaxed">
                Click a preset to launch WhatsApp instantly. Custom choices welcome!
              </p>
            </div>
            
            <button
              onClick={() => setShowPresetForm(!showPresetForm)}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 text-[10px] font-bold text-[var(--color-accent)] rounded-xl flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showPresetForm ? "Close Form" : "Add Choice"}</span>
            </button>
          </div>

          {/* Add custom preset form */}
          <AnimatePresence>
            {showPresetForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddPreset}
                className="mb-6 p-5 bg-[#FAF8F6] border border-[#F0EDE6] rounded-3xl space-y-4 overflow-hidden shadow-inner"
              >
                <div className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wide border-b border-[#F0EDE6] pb-2">
                  Create Custom Care Preset
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">Preset Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Bring midnight hot tea"
                      value={newPresetTitle}
                      onChange={(e) => setNewPresetTitle(e.target.value)}
                      className="w-full bg-white border border-[#F0EDE6] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">Category Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Sugar Rush / Academic SOS"
                      value={newPresetCategory}
                      onChange={(e) => setNewPresetCategory(e.target.value)}
                      className="w-full bg-white border border-[#F0EDE6] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">WhatsApp Message Text</label>
                  <textarea
                    placeholder="Enter pre-filled text that will open on WhatsApp..."
                    value={newPresetMessage}
                    onChange={(e) => setNewPresetMessage(e.target.value)}
                    className="w-full bg-white border border-[#F0EDE6] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] focus:outline-none h-20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                >
                  Save Preset Button
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Preset list */}
          <div className="space-y-4">
            {presets.map((preset) => (
              <div 
                key={preset.id} 
                className="w-full flex items-stretch gap-2 bg-[#FAF8F6] border border-[#F0EDE6] rounded-[2rem] hover:border-[var(--color-accent-light)] transition group shadow-inner"
              >
                <button
                  onClick={() => dispatchWhatsApp(preset.message)}
                  className="flex-1 text-left p-5 flex items-center justify-between gap-4 transition"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[var(--color-accent)] bg-rose-50 border border-rose-100 rounded px-2.5 py-0.5">
                      {preset.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-[var(--text-title)] mt-2">
                      {preset.label}
                    </h3>
                    <p className="text-xs text-slate-450 leading-snug font-medium">
                      {preset.description}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white text-[var(--color-accent)] border border-slate-100 rounded-2xl shadow-sm group-hover:bg-rose-50 transition-colors">
                    <Send className="w-4 h-4" />
                  </div>
                </button>

                {preset.isCustom && (
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="px-4 hover:bg-rose-50 border-l border-[#F0EDE6] text-slate-450 hover:text-rose-600 transition flex items-center justify-center rounded-r-[2rem]"
                    title="Delete Preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-4.5 h-4.5 mt-0.5 shrink-0 text-amber-500" />
            <div className="text-[10px] leading-relaxed font-mono font-bold">
              SECURITY PROTOCOL: High priority dispatch runs directly on standard client triggers. Bhaiya operations response latency of ~5 minutes applies.
            </div>
          </div>
        </div>
      </div>

      {/* --- DIGITAL SCRATCH COUPONS (Span 6, Expanded layout) --- */}
      <div className="lg:col-span-6 flex flex-col gap-8">
        <div className="bg-white border border-[#F0EDE6] rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F0EDE6]/80 pb-5 mb-6">
            <div>
              <h2 className="text-xs font-mono font-bold tracking-widest text-[var(--text-title)] uppercase flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-[var(--color-accent)]" />
                Sibling Scratch Vouchers
              </h2>
              <p className="text-xs text-[var(--text-main)] font-semibold opacity-75 mt-1 leading-relaxed">
                Click on the gray area to scratch and reveal. Add your own custom favors!
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCouponForm(!showCouponForm)}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/50 text-[10px] font-bold text-[var(--color-accent)] rounded-xl flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showCouponForm ? "Close Form" : "Add Voucher"}</span>
              </button>

              <button
                onClick={resetAllCoupons}
                className="text-[10px] font-mono font-bold text-slate-400 hover:text-[var(--color-accent)] transition focus-visible:outline-none"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Add custom coupon form */}
          <AnimatePresence>
            {showCouponForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddCoupon}
                className="mb-6 p-5 bg-[#FAF8F6] border border-[#F0EDE6] rounded-3xl space-y-4 overflow-hidden shadow-inner"
              >
                <div className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wide border-b border-[#F0EDE6] pb-2">
                  Create Custom Sibling Voucher
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">Voucher Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Free Movie Ticket Sponsored"
                    value={newCouponTitle}
                    onChange={(e) => setNewCouponTitle(e.target.value)}
                    className="w-full bg-white border border-[#F0EDE6] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">Voucher Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Bhai pays for movie ticket upon Lucknow visit."
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    className="w-full bg-white border border-[#F0EDE6] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">WhatsApp Claim Message</label>
                  <textarea
                    placeholder="Message sent when she redeems the voucher..."
                    value={newCouponMsg}
                    onChange={(e) => setNewCouponMsg(e.target.value)}
                    className="w-full bg-white border border-[#F0EDE6] rounded-xl px-3 py-2 text-xs text-[var(--text-title)] focus:outline-none h-16"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                >
                  Create Voucher Card
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Grid of Coupons (Bigger format) */}
          <div className="grid grid-cols-1 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="relative h-32 w-full rounded-[1.8rem] overflow-hidden border border-[#F0EDE6] bg-[#FAF8F6] shadow-inner"
              >
                {/* 1. Gray scratch sheet overlay */}
                <AnimatePresence>
                  {!coupon.revealed && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35 }}
                      onClick={() => scratchCoupon(coupon.id)}
                      className="absolute inset-0 z-10 cursor-pointer scratch-overlay-shimmer border-2 border-dashed border-slate-250 flex flex-col items-center justify-center rounded-[1.8rem]"
                    >
                      <Sparkles className="w-6 h-6 text-slate-455 mb-1.5 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Scratch to Unlock 💸
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Delete button for custom coupon (Float in corner) */}
                {coupon.isCustom && (
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="absolute top-2 right-2 z-20 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                    title="Delete Custom Voucher"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* 2. Revealed contents */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between items-center text-center">
                  <div className="pr-6 pl-6">
                    <h3 className="text-sm sm:text-base font-black text-[var(--text-title)]">
                      {coupon.title}
                    </h3>
                    <p className="text-[10.5px] sm:text-xs text-slate-455 font-medium leading-snug mt-1">
                      {coupon.description}
                    </p>
                  </div>

                  {coupon.redeemed ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 font-mono tracking-wide">
                      <CheckCircle className="w-4 h-4" />
                      <span>REDEEMED & WHATSAPP DISPATCHED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => redeemCoupon(coupon.id, coupon.message)}
                      className="py-1.5 px-6 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold rounded-xl shadow-sm transition duration-300 transform active:scale-95 flex items-center gap-1 hover:shadow-rose-500/10"
                    >
                      <span>Redeem on WhatsApp &rarr;</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
