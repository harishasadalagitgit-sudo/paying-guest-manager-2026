import React, { useState, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import type { Resident, PaymentRecord, ResidentID } from "../types";
import {
  User, Phone, Home, Calendar, AlertCircle, CheckCircle,
  LogOut, Upload, CreditCard, Clock, ChevronRight, Camera, FileText, X,
} from "lucide-react";

const GOLD = "#C9A84C";
const NAVY = "#2F3F5E";
const CREAM = "#F8F7F4";

// ── MI SPACE branding ─────────────────────────────────────────────────────────
const MiSpaceTextBrand = ({ theme = "light" }: { theme?: "light" | "dark" }) => {
  const titleColor = theme === "dark" ? "#93C572" : "#4a7a38";
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <div className="w-5 h-[1.5px] rounded-full flex-shrink-0" style={{ background: GOLD }} />
        <span className="text-sm font-black uppercase tracking-[0.30em]" style={{ color: titleColor, fontFamily: "Arial, Helvetica, sans-serif" }}>MI SPACE</span>
        <div className="w-5 h-[1.5px] rounded-full flex-shrink-0" style={{ background: GOLD }} />
      </div>
      <p className="text-[8px] font-medium uppercase tracking-[0.38em] mt-0.5" style={{ color: GOLD, fontFamily: "Arial, Helvetica, sans-serif" }}>LUXURY CO-LIVING</p>
    </div>
  );
};

// ── Resident Login screen ──────────────────────────────────────────────────────
function ResidentLogin({ onFound }: { onFound: (r: Resident) => void }) {
  const [mobile, setMobile] = useState("");
  const [fullName, setFullName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roomNum, setRoomNum] = useState("");
  const [bedNum, setBedNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "residents"), where("mobileNumber", "==", mobile.trim()))
      );
      if (snap.empty) {
        setError("No resident found with this mobile number.");
        return;
      }
      const data = snap.docs[0].data() as Omit<Resident, "id">;
      const resident: Resident = { id: snap.docs[0].id, ...data };

      // Validate full name (case-insensitive)
      const nameMatch = resident.name.trim().toLowerCase() === fullName.trim().toLowerCase();

      // Optional last name check (if provided, must match last word of stored name)
      let lastNameMatch = true;
      if (lastName.trim()) {
        const storedLastName = resident.name.trim().split(" ").pop() ?? "";
        lastNameMatch = storedLastName.toLowerCase() === lastName.trim().toLowerCase();
      }

      // Validate room number and bed number
      const roomMatch = resident.roomNum === roomNum.trim();
      const bedMatch = resident.bedNum === parseInt(bedNum.trim(), 10);

      if (!nameMatch || !lastNameMatch || !roomMatch || !bedMatch) {
        setError("Details do not match our records. Please check and try again.");
        return;
      }

      onFound(resident);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/8 text-white placeholder-white/25 text-sm border border-white/10 rounded-xl px-4 py-3 focus:outline-none transition-all focus:border-[#C9A84C]/60";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#002147" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 space-y-3">
          <MiSpaceTextBrand theme="dark" />
          <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold">Resident Portal</p>
        </div>

        <div className="bg-white/6 border border-white/10 rounded-3xl p-7 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}40` }}>
              <User className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Resident Login</h2>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Verify your identity to continue</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.15em] mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
              <input type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)}
                placeholder="92 57 57 57 48" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.15em] mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="As registered (e.g. Rahul Sharma)" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.15em] mb-1.5">Room No. <span className="text-red-400">*</span></label>
                <input type="text" required value={roomNum} onChange={(e) => setRoomNum(e.target.value)}
                  placeholder="e.g. 101" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.15em] mb-1.5">Bed No. <span className="text-red-400">*</span></label>
                <input type="number" required min={1} value={bedNum} onChange={(e) => setBedNum(e.target.value)}
                  placeholder="e.g. 2" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.15em] mb-1.5">Last Name <span className="text-white/25">(optional)</span></label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="Additional verification (optional)" className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full font-black text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-slate-900 mt-1"
              style={{ background: GOLD }}
            >
              {loading ? <><Clock className="w-4 h-4 animate-spin" /> Verifying...</> : <><ChevronRight className="w-4 h-4" /> Login to My Account</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Resident Dashboard ─────────────────────────────────────────────────────────
function ResidentDashboard({ resident, onLogout }: { resident: Resident; onLogout: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  const payments: PaymentRecord[] = resident.paymentHistoryJson
    ? JSON.parse(resident.paymentHistoryJson)
    : [];
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const ids: ResidentID[] = resident.idsJson ? JSON.parse(resident.idsJson) : [];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const base64 = await fileToBase64(file);
      await updateDoc(doc(db, "residents", resident.id), { photo: base64 });
      setUploadMsg("Photo updated successfully.");
    } catch {
      setUploadMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const idType = prompt("ID Type (e.g. Aadhaar Card, College ID, PAN Card):");
    if (!idType) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const base64 = await fileToBase64(file);
      const newId: ResidentID = {
        id: Date.now().toString(),
        type: idType,
        idName: file.name,
        fileData: base64,
        uploadedAt: new Date().toISOString(),
      };
      const updated = [...ids, newId];
      await updateDoc(doc(db, "residents", resident.id), { idsJson: JSON.stringify(updated) });
      setUploadMsg("ID proof uploaded successfully.");
    } catch {
      setUploadMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: CREAM }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 px-5 md:px-10 py-3 flex items-center justify-between shadow-sm" style={{ background: "rgba(248,247,244,0.95)", backdropFilter: "blur(12px)" }}>
        <MiSpaceTextBrand theme="light" />
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs font-bold text-slate-500">Resident Portal</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-full transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, #002147 0%, ${NAVY} 60%, #1e2d4a 100%)` }}>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: `${GOLD}99` }}>Welcome Back</p>
          <h1 className="text-2xl font-black tracking-tight">{resident.name}</h1>
          <p className="text-white/50 text-xs mt-1">Room {resident.roomNum}{resident.bedNum ? ` · Bed ${resident.bedNum}` : ""} · Member since {resident.joiningDate}</p>
        </div>

        {/* Balance card */}
        <div className={`rounded-2xl p-6 border-2 ${resident.balanceAmount > 0 ? "border-red-300 bg-red-50" : "border-emerald-300 bg-emerald-50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Outstanding Balance</p>
              <p className={`text-4xl font-black ${resident.balanceAmount > 0 ? "text-red-600" : "text-emerald-600"}`}>
                ₹{resident.balanceAmount.toLocaleString()}
              </p>
              <p className={`text-xs font-semibold mt-1 ${resident.balanceAmount > 0 ? "text-red-500" : "text-emerald-600"}`}>
                {resident.balanceAmount > 0 ? "Please clear before the 2nd of this month" : "All dues cleared — Thank you!"}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${resident.balanceAmount > 0 ? "bg-red-100" : "bg-emerald-100"}`}>
              {resident.balanceAmount > 0
                ? <AlertCircle className="w-7 h-7 text-red-500" />
                : <CheckCircle className="w-7 h-7 text-emerald-500" />}
            </div>
          </div>
        </div>

        {/* Profile + photo upload */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: GOLD }} />
            My Profile
          </h3>
          <div className="flex gap-6 items-start">
            {/* Profile photo */}
            <div className="shrink-0 text-center space-y-2">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                {resident.photo
                  ? <img src={resident.photo} alt="Profile" className="w-full h-full object-cover" />
                  : <User className="w-10 h-10 text-slate-400" />}
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <button
                onClick={() => photoRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-lg cursor-pointer transition"
                style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}40` }}
              >
                <Camera className="w-3 h-3" />
                {resident.photo ? "Change Photo" : "Upload Photo"}
              </button>
            </div>

            {/* Info grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { icon: User, label: "Name", value: resident.name },
                { icon: Phone, label: "Mobile", value: resident.mobileNumber },
                { icon: Phone, label: "WhatsApp", value: resident.whatsappNumber },
                { icon: Home, label: "Room / Bed", value: `Room ${resident.roomNum}${resident.bedNum ? ` / Bed ${resident.bedNum}` : ""}` },
                { icon: Calendar, label: "Joining Date", value: resident.joiningDate },
                { icon: Calendar, label: "Date of Birth", value: resident.dob },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-3.5 py-3">
                  <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GOLD }} />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {uploadMsg && (
            <div className={`mt-4 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 ${uploadMsg.includes("success") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {uploadMsg.includes("success") ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {uploadMsg}
            </div>
          )}
        </div>

        {/* ID Proofs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: GOLD }} />
              ID Proofs
            </h3>
            <div>
              <input ref={idRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleIdUpload} />
              <button
                onClick={() => idRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}40` }}
              >
                <Upload className="w-3 h-3" />
                Upload ID
              </button>
            </div>
          </div>
          {ids.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-4">No ID proofs uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {ids.map((idDoc) => (
                <div key={idDoc.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{idDoc.type}</p>
                    <p className="text-[10px] text-slate-400">{idDoc.idName} · {new Date(idDoc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  {idDoc.fileData && (
                    <a href={idDoc.fileData} target="_blank" rel="noreferrer" className="text-[10px] font-bold underline" style={{ color: GOLD }}>View</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-2">
            <CreditCard className="w-4 h-4" style={{ color: GOLD }} />
            Recent Payments
          </h3>
          {recentPayments.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-4">No payment records found.</p>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}15` }}>
                      <CreditCard className="w-3.5 h-3.5" style={{ color: GOLD }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{p.paymentMode}</p>
                      <p className="text-[10px] text-slate-400">{p.date}{p.notes ? ` · ${p.notes}` : ""}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600">₹{p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function ResidentPortal({ onBack }: { onBack: () => void }) {
  const [resident, setResident] = useState<Resident | null>(null);

  if (!resident) return <ResidentLogin onFound={setResident} />;
  return <ResidentDashboard resident={resident} onLogout={() => { setResident(null); onBack(); }} />;
}
