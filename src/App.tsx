import React, { useState } from "react";
import VisitorPortal from "./components/VisitorPortal";
import AdminPortal from "./components/AdminPortal";
import ResidentPortal from "./components/ResidentPortal";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function App() {
  const [role, setRole] = useState<"visitor" | "admin" | "resident">("visitor");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // Login form values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (username.trim() === "admin" && password === "admin123") {
      setIsAdminAuthenticated(true);
    } else {
      setErrorMessage("Incorrect username or password. Please try again.");
    }
  };

  return (
    <div className="font-sans antialiased min-h-screen bg-slate-50 text-slate-800" id="main-app">
      {role === "resident" ? (
        <ResidentPortal onBack={() => setRole("visitor")} />
      ) : role === "visitor" ? (
        <VisitorPortal
          onSwitchToAdmin={() => setRole("admin")}
          onSwitchToResident={() => setRole("resident")}
        />
      ) : (
        // Admin View
        isAdminAuthenticated ? (
          <AdminPortal onLogout={() => {
            setIsAdminAuthenticated(false);
            setRole("visitor");
            setUsername("");
            setPassword("");
          }} />
        ) : (
          // Admin Auth Lock Screen
          <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden" id="admin-auth-lock">
            {/* Ambient visual background glow */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-650/15 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-505/10 rounded-full filter blur-3xl"></div>

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
              
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  {/* — MI SPACE — brand */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-[1.5px] rounded-full flex-shrink-0" style={{ background: "#C9A84C" }} />
                    <span className="text-base font-black uppercase tracking-[0.30em] text-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>MI SPACE</span>
                    <div className="w-5 h-[1.5px] rounded-full flex-shrink-0" style={{ background: "#C9A84C" }} />
                  </div>
                  <p className="text-[8px] font-medium uppercase tracking-[0.38em]" style={{ color: "#C9A84C", fontFamily: "Arial, Helvetica, sans-serif" }}>LUXURY CO-LIVING</p>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1.5">Enter passcode to unlock registry</p>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-200 text-center font-bold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admin Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-slate-800/80 text-white text-sm border border-slate-705 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-505 transition shadow-sm"
                  />
                </div>

                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Access Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/80 text-white text-sm border border-slate-705 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-505 transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 bottom-3.5 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-indigo-900/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Dashboard</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setRole("visitor")}
                  className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                  &larr; Back to PG Information Page
                </button>
              </div>

            </div>
          </div>
        )
      )}
    </div>
  );
}
