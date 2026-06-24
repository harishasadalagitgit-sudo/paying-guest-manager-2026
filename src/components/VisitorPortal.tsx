import React, { useState } from "react";
import {
  MapPin,
  Wifi,
  ShieldCheck,
  Utensils,
  Sparkles,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
  Bed,
  Tv,
  Calendar,
  Lock,
  MessageSquare,
  Dumbbell,
  Zap,
  Wind,
  Leaf,
  Video,
  WashingMachine,
  Star,
  Hotel,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Enquiry, HotelBookingRequest } from "../types";

interface VisitorPortalProps {
  onSwitchToAdmin: () => void;
  onSwitchToResident: () => void;
}

const CREAM = "#F8F7F4";
const CREAM_DEEP = "#EFECE7";
const GOLD = "#C9A84C";
const NAVY = "#2F3F5E";

// Circle "mi" mark with calligraphic swash flourishes matching MiSpaceLogo.jpg
const MiSpaceCircleMark = ({ size = 40, bg = "white" }: { size?: number; bg?: string }) => (
  <svg width={size} height={size} viewBox="0 0 66 58" xmlns="http://www.w3.org/2000/svg">
    {/* Solid fill behind circle only (not behind flourishes) */}
    <circle cx="28" cy="28" r="22" fill={bg} />
    {/* Outer ring */}
    <circle cx="28" cy="28" r="22" fill="none" stroke={GOLD} strokeWidth="1.4"/>
    {/* Inner ring */}
    <circle cx="28" cy="28" r="17" fill="none" stroke={GOLD} strokeWidth="0.7"/>
    {/* Left swash — entry flourish sweeping up from lower-left into base of "m" */}
    <path d="M 3,54 C 5,47 11,42 17,38"
      fill="none" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round"/>
    {/* "mi" italic calligraphic script */}
    <text x="27" y="38" textAnchor="middle"
      fontFamily="Georgia,'Times New Roman',serif"
      fontStyle="italic" fontSize="21" fontWeight="400" fill={GOLD}>mi</text>
    {/* Right swash — exit flourish sweeping up-right from top of "i" */}
    <path d="M 39,20 C 46,14 54,10 62,8"
      fill="none" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

// "— MI SPACE —  /  LUXURY CO-LIVING  /  ⌂ ornament" text brand
const MiSpaceTextBrand = ({
  theme = "light",
  size = "md",
  showSubtitle = true,
  showOrnament = false,
}: {
  theme?: "light" | "dark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  showOrnament?: boolean;
}) => {
  const titleColor = theme === "dark" ? "#93C572" : "#4a7a38";
  const cfg = {
    xs: { title: "text-xs",    track: "tracking-[0.28em]", sub: "text-[7px]",   subTrack: "tracking-[0.32em]", line: "w-4 h-[1.5px]", gap: "gap-1.5" },
    sm: { title: "text-sm",    track: "tracking-[0.30em]", sub: "text-[8px]",   subTrack: "tracking-[0.35em]", line: "w-5 h-[1.5px]", gap: "gap-2"   },
    md: { title: "text-base",  track: "tracking-[0.32em]", sub: "text-[9px]",   subTrack: "tracking-[0.38em]", line: "w-6 h-[1.5px]", gap: "gap-2.5" },
    lg: { title: "text-xl",    track: "tracking-[0.34em]", sub: "text-[10px]",  subTrack: "tracking-[0.40em]", line: "w-8 h-[2px]",   gap: "gap-3"   },
    xl: { title: "text-3xl",   track: "tracking-[0.36em]", sub: "text-[12px]",  subTrack: "tracking-[0.42em]", line: "w-10 h-[2px]",  gap: "gap-4"   },
  }[size];
  return (
    <div className="flex flex-col items-center">
      {/* — MI SPACE — */}
      <div className={`flex items-center ${cfg.gap}`}>
        <div className={`${cfg.line} rounded-full flex-shrink-0`} style={{ background: GOLD }} />
        <span className={`${cfg.title} font-black uppercase ${cfg.track}`} style={{ color: titleColor, fontFamily: "Arial, Helvetica, sans-serif" }}>
          MI SPACE
        </span>
        <div className={`${cfg.line} rounded-full flex-shrink-0`} style={{ background: GOLD }} />
      </div>
      {/* LUXURY CO-LIVING */}
      {showSubtitle && (
        <p className={`${cfg.sub} font-medium uppercase ${cfg.subTrack} mt-1`} style={{ color: GOLD, fontFamily: "Arial, Helvetica, sans-serif" }}>
          LUXURY CO-LIVING
        </p>
      )}
      {/* Home ornament with flanking lines */}
      {showOrnament && (
        <div className="flex items-center gap-2 mt-2.5">
          <div className="w-10 h-px" style={{ background: GOLD }} />
          <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
            <polyline points="0,6 6.5,1 13,6" stroke={GOLD} strokeWidth="0.9" fill="none"/>
            <rect x="3" y="6" width="7" height="5" stroke={GOLD} strokeWidth="0.9" fill="none"/>
            <rect x="5" y="8" width="3" height="3" stroke={GOLD} strokeWidth="0.7" fill="none"/>
          </svg>
          <div className="w-10 h-px" style={{ background: GOLD }} />
        </div>
      )}
    </div>
  );
};

export default function VisitorPortal({ onSwitchToAdmin, onSwitchToResident }: VisitorPortalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyCollege, setCompanyCollege] = useState("");
  const [expectedJoiningDate, setExpectedJoiningDate] = useState("");
  const [sharingInterest, setSharingInterest] = useState<"1room share" | "2room share" | "3room share" | "4room share" | "5room share">("4room share");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeImageTab, setActiveImageTab] = useState(0);

  // Gallery — auto-discovers all jpg/png files in public/galleryimages at build time
  const [showGallery, setShowGallery] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const galleryImages = (() => {
    const modules = import.meta.glob("/public/galleryimages/*.{jpg,jpeg,png,JPG,JPEG,PNG}", { eager: true });
    return Object.keys(modules)
      .map((p) => p.replace("/public", ""))
      .sort((a, b) => {
        const n = (s: string) => parseInt(s.match(/\d+/)?.[0] ?? "0", 10);
        return n(a) - n(b);
      });
  })();

  // Hotel booking form state
  const [bkName, setBkName] = useState("");
  const [bkPhone, setBkPhone] = useState("");
  const [bkEmail, setBkEmail] = useState("");
  const [bkCheckIn, setBkCheckIn] = useState("");
  const [bkCheckOut, setBkCheckOut] = useState("");
  const [bkRooms, setBkRooms] = useState(1);
  const [bkAdults, setBkAdults] = useState(1);
  const [bkChildren, setBkChildren] = useState(0);
  const [bkHasFemales, setBkHasFemales] = useState(false);
  const [bkNotes, setBkNotes] = useState("");
  const [bkSubmitting, setBkSubmitting] = useState(false);
  const [bkSuccess, setBkSuccess] = useState(false);
  const [bkError, setBkError] = useState("");

  const bkMaxGuests = bkRooms * 3;
  const bkTotalGuests = bkAdults + bkChildren;
  const bkCapacityExceeded = bkTotalGuests > bkMaxGuests;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBkSubmitting(true);
    setBkError("");
    try {
      const req: Omit<HotelBookingRequest, "id"> = {
        guestName: bkName,
        phone: bkPhone,
        email: bkEmail,
        checkInDate: bkCheckIn,
        checkOutDate: bkCheckOut,
        numRooms: bkRooms,
        numAdults: bkAdults,
        numChildren: bkChildren,
        hasFemales: bkHasFemales,
        notes: bkNotes,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "hotelBookingRequests"), req);
      setBkSuccess(true);
    } catch {
      setBkError("Could not submit booking request. Please try again.");
    } finally {
      setBkSubmitting(false);
    }
  };

  const pgImages = [
    {
      url: "/MiSpaceBedPicLatest.png",
      title: "Luxury Rooms",
      desc: "Perfectly designed spacious rooms with premium beds and modern comforts.",
    },
    {
      url: "/MiSpacePersonalDeskNew.png",
      title: "Personal Workspace",
      desc: "Comfortable ergonomic study setups in every corner.",
    },
    {
      url: "/MiSpaceRoomCupboards.png",
      title: "Storage Options",
      desc: "Ample storage space with dedicated cupboards and shelving in every room.",
    },
  ];

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !expectedJoiningDate) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const newEnquiry: Omit<Enquiry, "id"> = {
        name, email, phone, companyCollege,
        expectedJoiningDate, sharingInterest,
        submittedAt: new Date().toISOString(),
        status: "Pending",
      };
      await addDoc(collection(db, "enquiries"), newEnquiry);
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEnquiry),
      });
      if (!response.ok) throw new Error("Server error");
      await response.json();
      setName(""); setEmail(""); setPhone(""); setCompanyCollege("");
      setExpectedJoiningDate(""); setSharingInterest("1room share");
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Enquiry submission error:", err);
      setErrorMsg("Could not submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans" style={{ background: CREAM }} id="visitor-portal">

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 backdrop-blur-xl border-b border-slate-200/60 py-3 px-5 md:px-14 flex justify-between items-center z-50 shadow-sm shadow-slate-100/50"
        style={{ background: "rgba(247,246,242,0.95)" }}
      >
        <div className="flex items-center gap-3">
          <MiSpaceCircleMark size={40} bg="#F8F7F4" />
          <MiSpaceTextBrand theme="light" size="sm" showSubtitle showOrnament={false} />
        </div>
        <p className="hidden lg:block text-[11px] font-semibold italic tracking-wide" style={{ color: `${NAVY}99` }}>
          More than a stay, a feeling of home
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <a
            href="#contact-section"
            className="inline-flex items-center gap-1.5 font-black text-xs px-2.5 py-2.5 sm:px-4 rounded-full transition-all duration-200 hover:brightness-110"
            style={{ background: GOLD, color: "#1a1200", boxShadow: `0 2px 10px ${GOLD}55` }}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Contact</span>
          </a>
          <button
            onClick={() => setShowGallery(true)}
            className="inline-flex items-center gap-1.5 font-black text-xs px-2.5 py-2.5 sm:px-4 rounded-full transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-95"
            style={{ background: GOLD, color: "#1a1200", boxShadow: `0 2px 10px ${GOLD}55` }}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Gallery</span>
          </button>
          <a
            href="#enquiry-section"
            className="inline-flex items-center gap-1.5 font-black text-xs px-2.5 py-2.5 sm:px-4 rounded-full transition-all duration-200 shadow-sm hover:brightness-110"
            style={{ background: GOLD, color: "#1a1200", boxShadow: `0 2px 10px ${GOLD}55` }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Book a Visit</span>
          </a>
          <button
            onClick={onSwitchToResident}
            className="inline-flex items-center gap-1.5 font-black text-xs px-2.5 py-2.5 sm:px-4 rounded-full transition-all duration-200 cursor-pointer hover:brightness-110"
            style={{ background: GOLD, color: "#1a1200", boxShadow: `0 2px 10px ${GOLD}55` }}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Account</span>
          </button>
          <button
            onClick={onSwitchToAdmin}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white font-semibold text-xs px-2.5 py-2.5 sm:px-4 rounded-full transition-all duration-200 cursor-pointer"
            id="admin-login-btn"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden py-16 md:py-24 px-5 md:px-14 lg:px-24"
        id="hero-banner"
        style={{ background: `linear-gradient(140deg, #002147 0%, ${NAVY} 45%, #162d50 100%)` }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full filter blur-3xl" style={{ background: `${GOLD}18` }}></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full filter blur-3xl" style={{ background: `${GOLD}0e` }}></div>
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full filter blur-2xl" style={{ background: `${GOLD}0a` }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div className="space-y-8 order-2 lg:order-1">
            <div>
              <div className="flex flex-col items-center gap-3">
                <MiSpaceCircleMark size={80} bg="transparent" />
                <MiSpaceTextBrand theme="dark" size="xl" showSubtitle showOrnament />
              </div>

              <div className="mt-6 space-y-0.5 text-center">
                <div className="text-sm sm:text-base md:text-lg font-black leading-tight tracking-tight" style={{ color: GOLD }}>MORE THAN A STAY,</div>
                <div className="text-sm sm:text-base md:text-lg font-black leading-tight tracking-tight" style={{ color: GOLD }}>A FEELING OF HOME.</div>
              </div>

              <div className="flex items-center gap-2.5 mt-4">
                {["Comfort", "Convenience", "Community"].map((word, i) => (
                  <React.Fragment key={word}>
                    {i > 0 && <span className="font-black" style={{ color: `${GOLD}80` }}>•</span>}
                    <span className="text-white/50 text-xs font-bold uppercase tracking-[0.18em]">{word}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <p className="text-white/50 text-sm leading-relaxed max-w-lg">
              Experience upscale boys paying guest accommodations designed to maximize focus, comfort, and community. Impeccable hygiene, nutritional meals daily, and top-tier security — all ready for you.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Wifi, label: "Unlimited HiSpeed WiFi" },
                { icon: Utensils, label: "3 Meals Daily" },
                { icon: ShieldCheck, label: "24/7 Security" },
                { icon: Zap, label: "Power Backup" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/6 border border-white/10 backdrop-blur-sm rounded-2xl px-4 py-3.5">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  <span className="text-xs font-bold text-white/75">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#enquiry-section"
                className="font-black flex items-center justify-center gap-2 px-7 py-4 rounded-2xl transition-all duration-200 shadow-lg text-sm text-white"
                style={{ background: GOLD, boxShadow: `0 8px 28px ${GOLD}55` }}
              >
                <Calendar className="w-4 h-4" />
                Book PG Visit / Enquiry
              </a>
              <a
                href="#hotel-section"
                className="font-black flex items-center justify-center gap-2 px-7 py-4 rounded-2xl transition-all duration-200 shadow-lg text-sm text-white"
                style={{ background: GOLD, boxShadow: `0 8px 28px ${GOLD}55` }}
              >
                <Hotel className="w-4 h-4" />
                Book Hotel Room
              </a>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3.5 bg-white/8 border border-white/12 backdrop-blur-sm px-5 py-3.5 rounded-2xl">
                <Phone className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.15em]">Contact</p>
                  <a href="tel:+919257575748" className="block text-sm font-black text-white hover:text-[#C9A84C] transition-colors">+91 92 57 57 57 48</a>
                  <a href="tel:+919257575749" className="block text-sm font-black text-white hover:text-[#C9A84C] transition-colors">+91 92 57 57 57 49</a>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=17.266462,78.387588"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 bg-white/8 border border-white/12 backdrop-blur-sm px-5 py-3.5 rounded-2xl hover:bg-white/12 transition-all duration-200"
              >
                <MapPin className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.15em]">Location</p>
                  <p className="text-sm font-black text-white">Open in Google Maps</p>
                </div>
              </a>
            </div>
          </div>

          <div className="space-y-3 order-1 lg:order-2" id="carousel-visuals">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-amber-900/40 border border-white/10 bg-slate-900">
              <img
                src={pgImages[activeImageTab].url}
                alt={pgImages[activeImageTab].title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain transition-all duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-7">
                <h3 className="text-xl font-black text-white mb-1">{pgImages[activeImageTab].title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{pgImages[activeImageTab].desc}</p>
              </div>
              <div className="absolute top-5 right-5 flex gap-2">
                {pgImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageTab(idx)}
                    className={`rounded-full transition-all duration-200 cursor-pointer ${activeImageTab === idx ? "w-5 h-2.5 bg-amber-400" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/80"}`}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {pgImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageTab(idx)}
                  className={`aspect-video overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${activeImageTab === idx ? "border-amber-500 shadow-lg shadow-[#C9A84C]/30" : "border-white/10 opacity-50 hover:opacity-80"}`}
                >
                  <img src={img.url} alt={img.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AUTHENTIC HOMELY FOOD ── */}
      <section
        className="relative overflow-hidden py-20 px-5 md:px-14 lg:px-24"
        style={{ background: CREAM }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2.5 bg-[#C9A84C]/12 border border-[#C9A84C]/30 rounded-full px-4 py-2">
              <Utensils className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs font-bold uppercase tracking-[0.18em]">Fresh • Hygienic • Nutritious</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2F3F5E] leading-none tracking-tight">AUTHENTIC</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black leading-none tracking-tight">
                <span style={{ color: "#C9A84C" }}>HOMELY FOOD</span>
              </div>
            </div>
            <div className="space-y-1.5 text-slate-600 text-base font-medium">
              <p>Nutritious • Hygienic • Fresh</p>
              <p>Prepared with Care,</p>
              <p className="text-[#C9A84C] font-bold text-xl">Every Single Day.</p>
            </div>
            <div className="space-y-3 pt-2">
              {[
                "Breakfast, Lunch & Dinner Included",
                "Pure RO Water Dispensers on Every Floor",
                "Festive Specials & Sunday Celebrations",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: GOLD }}></div>
                  <span className="text-slate-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ aspectRatio: "16/10" }}>
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"
                alt="Rooftop Restaurant & Garden"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-5 left-5 right-5 bg-black/70 backdrop-blur-sm rounded-2xl px-5 py-3.5 flex items-center gap-4 border border-white/10">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm tracking-wide">ROOF TOP RESTAURANT & GARDEN</p>
                <p className="text-white/55 text-xs">Relax, dine & unwind with a breathtaking view.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILT FOR COMFORT ── */}
      <section className="py-16 px-5 md:px-14 lg:px-24" style={{ background: "#002147" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-[11px] font-black text-[#C9A84C]/70 uppercase tracking-[0.35em] mb-12">
            — Built for Your Comfort &amp; Well-Being —
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Wind, title: "100% Ventilation", sub: "& Lighting" },
              { icon: Dumbbell, title: "GYM", sub: "Stay Fit, Stay Strong" },
              { icon: Leaf, title: "YOGA ROOM", sub: "Refresh Your Mind & Body" },
              { icon: Tv, title: "TV LOUNGE", sub: "Unwind, Relax & Recharge" },
              { icon: Gamepad2, title: "Indoor Games", sub: "Snooker, Table Tennis & More" },
              { icon: Utensils, title: "Self Cooking", sub: "Cook Your Own Meals Anytime" },
            ].map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="group flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-[#C9A84C]/20 hover:border-[#C9A84C]/60 hover:bg-white/5 transition-all duration-200 cursor-default bg-white/8"
              >
                <div className="w-16 h-16 bg-[#C9A84C]/10 group-hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 group-hover:border-[#C9A84C]/60 rounded-2xl flex items-center justify-center transition-all duration-200">
                  <Icon className="w-8 h-8 text-[#C9A84C] group-hover:text-[#C9A84C] transition-colors" />
                </div>
                <div>
                  <p className="font-black text-white text-[11px] uppercase tracking-wide leading-tight mb-1">{title}</p>
                  <p className="text-white/40 text-[10px] leading-snug font-medium">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MORE THAN JUST A STAY ── */}
      <section className="py-16 px-5 md:px-14 lg:px-24" style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black text-[#2F3F5E]/40 uppercase tracking-[0.35em] mb-3">
              — More Than Just a Stay —
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold text-xs px-5 py-2 rounded-full shadow-md shadow-[#C9A84C]/40">
              <Star className="w-3.5 h-3.5" />
              Indoor Games &amp; Recreation Available
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            {[
              { img: "/MiSpaceLoungeSofa.png", icon: Tv, label: "LUXURIOUS TV LOUNGE SPACE", sub: "Unwind. Relax. Recharge" },
              { img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=800", icon: Dumbbell, label: "FULLY EQUIPPED GYM", sub: "Stay Fit, Stay Strong" },
              { img: "/MiSpaceHotDesks.png", icon: Sparkles, label: "HOT DESKS", sub: "Work Smart, Work Comfortably" },
            ].map(({ img, icon: Icon, label, sub }) => (
              <div
                key={label}
                className="group relative overflow-hidden rounded-2xl shadow-md border border-[#C9A84C]/15 hover:shadow-xl transition-all duration-300 cursor-default"
                style={{ aspectRatio: "4/3" }}
              >
                <img src={img} alt={label} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#C9A84C]/90 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white font-black text-xs uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-white/60 text-xs font-medium ml-8">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { img: "/pgsnookertable.png", icon: Star, label: "SNOOKER ZONE", sub: "Play & Enjoy — All Day Fun", tag: "Indoor Game" },
              { img: "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=900", icon: Star, label: "TABLE TENNIS", sub: "Sharpen Your Focus, One Rally at a Time", tag: "Indoor Game" },
              { img: "/MiSpaceIndoorFootball.png", icon: Star, label: "INDOOR FOOTBALL", sub: "Kick Off & Have Fun", tag: "Indoor Game" },
            ].map(({ img, icon: Icon, label, sub, tag }) => (
              <div
                key={label}
                className="group relative overflow-hidden rounded-2xl shadow-md border border-[#C9A84C]/15 hover:shadow-xl transition-all duration-300 cursor-default"
                style={{ aspectRatio: "16/7" }}
              >
                <img src={img} alt={label} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">{tag}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#C9A84C]/90 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white font-black text-xs uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-white/60 text-xs font-medium ml-8">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WASHING MACHINES + CCTV ── */}
      <section className="py-14 px-5 md:px-14 lg:px-24" style={{ background: "#002147" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              img: "/pgwashingmachine.png",
              icon: WashingMachine,
              label: "WASHING MACHINES",
              sub: "Clean. Convenient. Anytime.",
              desc: "State-of-the-art washing machines available around the clock — keeping your laundry fresh and easy.",
            },
            {
              img: "/MiSpaceCCTV.png",
              icon: Video,
              label: "24 HRS CCTV SURVEILLANCE",
              sub: "Your Safety, Our Priority.",
              desc: "HD cameras cover every corner of the premises, 24 hours a day. Your safety is always in sharp focus.",
            },
          ].map(({ img, icon: Icon, label, sub, desc }) => (
            <div
              key={label}
              className="group flex rounded-2xl overflow-hidden border border-[#C9A84C]/20 hover:border-[#C9A84C]/40 transition-all duration-300 bg-white/6"
            >
              <div className="w-40 sm:w-48 shrink-0 overflow-hidden">
                <img src={img} alt={label} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center px-5 py-5 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span className="text-white font-black text-[11px] uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-[#C9A84C] font-bold text-sm mb-2">{sub}</p>
                <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INFO BENTO ── */}
      <section className="py-16 px-5 md:px-14 lg:px-24" style={{ background: CREAM }} id="features-highlights">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Utensils,
              title: "Home Kitchen Dining",
              desc: "Hygiene-certified meals. Multi-cuisine North & South Indian food cooked 3 times daily.",
              bullets: ["Breakfast, Lunch & Dinner Included", "Pure RO Water on Every Floor", "Festive Specials on Sundays"],
            },
            {
              icon: ShieldCheck,
              title: "Pristine & Safe Living",
              desc: "Your luxury PG experience is built around peaceful safety and spotless cleanliness, with daily professional housekeeping.",
              bullets: ["24/7 Security Guards & Active CCTV", "Daily Room & Bathroom Sanitization", "Unlimited HiSpeed Internet & Power Backup"],
            },
            {
              icon: MapPin,
              title: "Prime Accessible Location",
              desc: "Strategically located with easy access to key destinations. 10 minutes drive to International Airport. 19 minutes to HiTech City. All facilities available nearby.",
              bullets: [],
              contact: true,
            },
          ].map(({ icon: Icon, title, desc, bullets, contact }) => (
            <div
              key={title}
              className="bg-white p-7 rounded-2xl border border-[#C9A84C]/20 shadow-sm shadow-stone-200/60 hover:shadow-md hover:shadow-stone-300/40 transition-all duration-200 flex flex-col"
            >
              <div className="inline-flex bg-amber-50 border border-[#C9A84C]/25 p-3 rounded-xl mb-5 text-[#A8883A] w-fit">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed flex-1">{desc}</p>
              {bullets.length > 0 ? (
                <ul className="space-y-2.5 border-t border-[#C9A84C]/15 pt-4">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-3 border-t border-[#C9A84C]/15 pt-4">
                  {[
                    { icon: MapPin, text: "Shamshabad RB Nagar, Street No 4, Hyderabad, Telangana", href: undefined },
                    { icon: Mail, text: "mispacepayingguest@gmail.com", href: "mailto:mispacepayingguest@gmail.com" },
                    { icon: Phone, text: "+91 92 57 57 57 48", href: "tel:+919257575748" },
                    { icon: Phone, text: "+91 92 57 57 57 49", href: "tel:+919257575749" },
                  ].map(({ icon: CIcon, text, href }) => (
                    <div key={text} className="flex items-start gap-2 text-xs text-slate-600">
                      <CIcon className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                      {href ? (
                        <a href={href} className="font-medium leading-snug hover:text-[#C9A84C] transition-colors">{text}</a>
                      ) : (
                        <span className="font-medium leading-snug">{text}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT STRIP ── */}
      <section className="py-16 px-5 md:px-14 lg:px-24" style={{ background: "#002147" }} id="contact-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
            <div className="space-y-5">
              <div>
                <p className="text-[#C9A84C]/70 text-[10px] font-black uppercase tracking-[0.35em] mb-1">Contact</p>
                <p className="text-white font-black text-lg">Uday Reddy</p>
                <p className="text-white/40 text-xs font-semibold">MiSpace UltraLuxury Paying Guest</p>
              </div>
              <div className="space-y-3">
                {["+91 92 57 57 57 48", "+91 92 57 57 57 49"].map((num) => (
                  <a key={num} href={`tel:${num.replace(/\s/g, "")}`} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-[#C9A84C]/15 border border-[#C9A84C]/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C9A84C]/25 transition">
                      <Phone className="w-4 h-4 text-[#C9A84C]" />
                    </div>
                    <span className="text-white text-xl sm:text-2xl font-black tracking-[0.08em] group-hover:text-[#C9A84C] transition">{num}</span>
                  </a>
                ))}
              </div>
              <a
                href="https://maps.google.com/?q=17.266462,78.387588"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition hover:bg-[#C9A84C]/10"
                style={{ color: GOLD, borderColor: `${GOLD}40` }}
              >
                <MapPin className="w-3.5 h-3.5" />
                Open in Google Maps
              </a>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { icon: Utensils, label: "Authentic Homely Food" },
                { icon: Wind, label: "100% Ventilation & Lighting" },
                { icon: Wifi, label: "Unlimited HiSpeed WiFi" },
                { icon: Zap, label: "24 Hrs Power Back" },
                { icon: ShieldCheck, label: "Safe · Clean · Secure" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2.5 text-center p-4 bg-white/5 hover:bg-[#C9A84C]/10 rounded-2xl border border-white/8 hover:border-[#C9A84C]/30 transition-all duration-200">
                  <Icon className="w-5 h-5 text-[#C9A84C]" />
                  <span className="text-white/50 text-[9px] font-bold uppercase leading-tight tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-wrap gap-4 justify-center items-center">
            {[
              { icon: Star, text: "Like Home, Only Better" },
              { icon: CheckCircle, text: "Safe · Clean · Secure" },
              { icon: ShieldCheck, text: "Trusted by 100+ Residents" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/8">
                <Icon className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span className="text-white/50 text-xs font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENQUIRY FORM ── */}
      <section
        className="py-20 px-5 md:px-14 lg:px-24"
        id="enquiry-section"
        style={{ background: CREAM }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-5 space-y-7">
            <div className="inline-block bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
              Booking Enquiries Open
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2F3F5E] leading-tight tracking-tight">
              Secure Your Spot at MiSpace Today
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Rooms fill up fast for seasonal intakes. Submit your quick enquiry — a coordinator will call you back within 15 minutes to arrange a personal or guided virtual tour.
            </p>
            <div className="space-y-3.5 pt-2">
              {[
                "Instant Admin Alert Dispatched",
                "Transparent Pricing Guarantee",
                "Secure Direct Firestore Record Logs",
                "Email Alert Routed to mispacepayingguest@gmail.com",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#C9A84C]/20 shadow-md shadow-stone-200/60">
              <h3 className="text-lg font-black text-[#2F3F5E] mb-7 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#C9A84C]/15 border border-[#C9A84C]/30 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#C9A84C]" />
                </div>
                Enquiry Request Form
              </h3>

              {isSuccess ? (
                <div className="text-center space-y-6 py-10" id="enquiry-success-box">
                  <div className="mx-auto w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-[#2F3F5E] mb-2">Enquiry Submitted!</h4>
                    <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                      An automated notification has been dispatched to{" "}
                      <span className="text-[#C9A84C] font-bold">mispacepayingguest@gmail.com</span>. You will receive a callback shortly.
                    </p>
                  </div>
                  <button onClick={() => setIsSuccess(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 cursor-pointer">
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-5" id="visitor-form">
                  {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-700 text-xs text-center font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Your Name <span className="text-rose-500">*</span></label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                        className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Email Address <span className="text-rose-500">*</span></label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com"
                        className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Phone Number <span className="text-rose-500">*</span></label>
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 92 57 57 57 48"
                        className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">College / Company</label>
                      <input type="text" value={companyCollege} onChange={(e) => setCompanyCollege(e.target.value)} placeholder="E.g., NIT Bangalore"
                        className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Expected Joining Date <span className="text-rose-500">*</span></label>
                      <input type="date" required value={expectedJoiningDate} onChange={(e) => setExpectedJoiningDate(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Room Sharing Type <span className="text-rose-500">*</span></label>
                      <select value={sharingInterest} onChange={(e) => setSharingInterest(e.target.value as any)}
                        className="w-full bg-white text-slate-900 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200">
                        <option value="1room share">1 Sharing</option>
                        <option value="2room share">2 Sharing</option>
                        <option value="3room share">3 Sharing</option>
                        <option value="4room share">4 Sharing</option>
                        <option value="5room share">5 Sharing</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full font-black py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 text-sm mt-2 text-slate-900"
                    style={{ background: GOLD, boxShadow: `0 4px 20px ${GOLD}55` }}
                    id="submit-enquiry-btn">
                    {isSubmitting ? (
                      <><Clock className="w-4 h-4 animate-spin" /><span>Submitting...</span></>
                    ) : (
                      <><Send className="w-4 h-4" /><span>Submit Enquiry &amp; Send Email</span></>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-[0.12em]">
                    Your enquiry dispatches a mail to mispacepayingguest@gmail.com
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOTEL BOOKING SECTION ── */}
      <section
        className="py-20 px-5 md:px-14 lg:px-24"
        id="hotel-section"
        style={{ background: CREAM }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-5 space-y-7">
            <div className="inline-block bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
              Hotel Bookings Open
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2F3F5E] leading-tight tracking-tight">
              Book a Hotel Room at MiSpace
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Hosting guests or need a short stay? Our premium hotel rooms on Floor 5 offer luxury suites with all amenities. Submit your request and our team will confirm availability within 2 hours.
            </p>
            <div className="space-y-3.5 pt-2">
              {[
                "Floor 5 · Luxury Suites",
                "Male Guests Only",
                "Confirmed within 2 Hours",
                "All MiSpace Amenities Included",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#C9A84C]/20 shadow-md shadow-stone-200/60">
              <h3 className="text-lg font-black text-[#2F3F5E] mb-7 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#C9A84C]/15 border border-[#C9A84C]/30 rounded-lg flex items-center justify-center">
                  <Hotel className="w-4 h-4 text-[#C9A84C]" />
                </div>
                Hotel Room Booking Request
              </h3>

              {bkSuccess ? (
                <div className="text-center space-y-6 py-10">
                  <div className="mx-auto w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-[#2F3F5E] mb-2">Request Submitted!</h4>
                    <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Our team will contact you within 2 hours to confirm availability and discuss payment.
                    </p>
                  </div>
                  <button onClick={() => { setBkSuccess(false); setBkName(""); setBkPhone(""); setBkEmail(""); setBkCheckIn(""); setBkCheckOut(""); setBkNotes(""); setBkRooms(1); setBkAdults(1); setBkChildren(0); setBkHasFemales(false); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 cursor-pointer">
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  {bkError && (
                    <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-700 text-xs text-center font-semibold">{bkError}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Full Name <span className="text-rose-500">*</span></label>
                      <input type="text" required value={bkName} onChange={(e) => setBkName(e.target.value)} placeholder="Your full name"
                        className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Phone Number <span className="text-rose-500">*</span></label>
                      <input type="tel" required value={bkPhone} onChange={(e) => setBkPhone(e.target.value)} placeholder="+91 92 57 57 57 48"
                        className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Email Address <span className="text-rose-500">*</span></label>
                    <input type="email" required value={bkEmail} onChange={(e) => setBkEmail(e.target.value)} placeholder="your@email.com"
                      className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Check-in <span className="text-rose-500">*</span></label>
                      <input type="date" required value={bkCheckIn} onChange={(e) => setBkCheckIn(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Check-out <span className="text-rose-500">*</span></label>
                      <input type="date" required value={bkCheckOut} onChange={(e) => setBkCheckOut(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Rooms <span className="text-rose-500">*</span></label>
                      <input type="number" required min={1} value={bkRooms} onChange={(e) => setBkRooms(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-50 text-slate-900 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Adults <span className="text-rose-500">*</span></label>
                      <input type="number" required min={1} value={bkAdults} onChange={(e) => setBkAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-50 text-slate-900 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Children</label>
                      <input type="number" min={0} value={bkChildren} onChange={(e) => setBkChildren(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 text-slate-900 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Group Includes Female Guests?</label>
                    <div className="flex gap-3">
                      {[{ val: false, label: "Male Only" }, { val: true, label: "Includes Females" }].map(({ val, label }) => (
                        <button key={label} type="button" onClick={() => setBkHasFemales(val)}
                          className="flex-1 text-xs font-black py-2.5 rounded-xl border-2 transition cursor-pointer"
                          style={{ background: bkHasFemales === val ? (val ? "#fef2f2" : `${GOLD}15`) : "#f8fafc", borderColor: bkHasFemales === val ? (val ? "#ef4444" : GOLD) : "#e2e8f0", color: bkHasFemales === val ? (val ? "#dc2626" : NAVY) : "#64748b" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {bkHasFemales && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <span className="text-base shrink-0">⚠️</span>
                      <p className="text-xs font-semibold text-red-700 leading-relaxed">MiSpace is a <strong>Boys-Only</strong> facility. Accommodation for female guests is not available.</p>
                    </div>
                  )}
                  {bkCapacityExceeded && (
                    <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                      <span className="text-base shrink-0">⚠️</span>
                      <p className="text-xs font-semibold text-orange-800 leading-relaxed"><strong>{bkRooms} room{bkRooms > 1 ? "s" : ""}</strong> can accommodate up to <strong>{bkMaxGuests} guests</strong> (3 per room). Please increase rooms.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.15em]">Notes / Special Requests</label>
                    <textarea rows={2} value={bkNotes} onChange={(e) => setBkNotes(e.target.value)} placeholder="Any special requirements..."
                      className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A84C]/70 transition-all duration-200 resize-none" />
                  </div>
                  <button type="submit" disabled={bkSubmitting}
                    className="w-full font-black text-sm py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-slate-900"
                    style={{ background: GOLD, boxShadow: `0 8px 28px ${GOLD}55` }}>
                    {bkSubmitting ? <><Clock className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Booking Request</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOATING ENQUIRY BUTTON ── */}
      <a
        href="#enquiry-section"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm px-5 py-3.5 rounded-full shadow-2xl shadow-[#C9A84C]/50 transition-all duration-200 hover:scale-105"
        aria-label="Open Enquiry Form"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-40"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-900"></span>
        </span>
        <MessageSquare className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Enquire Now</span>
      </a>

      {/* ── GALLERY CAROUSEL ── */}
      {showGallery && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center" style={{ background: "rgba(6,15,28,0.97)" }}>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-black text-white">MiSpace Gallery</h3>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: GOLD }}>
                {lightboxIndex + 1} / {galleryImages.length}
              </p>
            </div>
            <button onClick={() => setShowGallery(false)}
              className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition cursor-pointer">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Main image */}
          <div className="flex items-center gap-4 px-4 mt-16 mb-20 w-full max-w-4xl">
            <button
              onClick={() => setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length)}
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition cursor-pointer"
              style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}40` }}>
              <ChevronLeft className="w-5 h-5" style={{ color: GOLD }} />
            </button>

            <div className="flex-1 flex items-center justify-center" style={{ minHeight: "60vh" }}>
              <img
                key={lightboxIndex}
                src={galleryImages[lightboxIndex]}
                alt={`MiSpace photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl"
                style={{ animation: "fadeIn 0.25s ease" }}
              />
            </div>

            <button
              onClick={() => setLightboxIndex((lightboxIndex + 1) % galleryImages.length)}
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition cursor-pointer"
              style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}40` }}>
              <ChevronRight className="w-5 h-5" style={{ color: GOLD }} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-6 flex items-center gap-2">
            {galleryImages.map((_, i) => (
              <button key={i} onClick={() => setLightboxIndex(i)}
                className="rounded-full transition-all duration-200 cursor-pointer"
                style={{
                  width: i === lightboxIndex ? 20 : 6,
                  height: 6,
                  background: i === lightboxIndex ? GOLD : "rgba(255,255,255,0.25)",
                }} />
            ))}
          </div>

          <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
      )}


      {/* ── FOOTER ── */}
      <footer className="py-12 pb-24 sm:pb-12 px-6 border-t border-white/8" style={{ background: "#060f1e" }} id="visitor-footer">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2">
            <MiSpaceCircleMark size={42} bg="transparent" />
            <MiSpaceTextBrand theme="dark" size="md" showSubtitle showOrnament />
          </div>
          <p className="text-[#C9A84C] font-black text-xl uppercase tracking-[0.3em] text-center">LIVE BETTER. STAY BETTER.</p>

          <div className="w-full h-px bg-white/8" />

          {/* Contact grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: GOLD }}>Contact Person</p>
              <p className="text-white font-bold text-sm">Uday Reddy</p>
              <p className="text-white/40 text-xs">MiSpace UltraLuxury Paying Guest</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: GOLD }}>Phone</p>
              <a href="tel:+919257575748" className="block text-white font-bold text-sm hover:text-[#C9A84C] transition">+91 92 57 57 57 48</a>
              <a href="tel:+919257575749" className="block text-white font-bold text-sm hover:text-[#C9A84C] transition">+91 92 57 57 57 49</a>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: GOLD }}>Location</p>
              <a
                href="https://maps.google.com/?q=17.266462,78.387588"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-[#C9A84C] transition text-xs font-semibold"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                Open in Google Maps
              </a>
            </div>
          </div>

          <div className="w-full h-px bg-white/8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs font-medium">
              &copy; {new Date().getFullYear()} MiSpace Paying Guest (Boys PG). All rights reserved.
            </p>
            <button onClick={onSwitchToAdmin} className="text-slate-600 hover:text-[#C9A84C] text-xs font-semibold transition-colors duration-200 cursor-pointer">
              Admin Portal →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
