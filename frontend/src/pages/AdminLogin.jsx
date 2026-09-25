import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import RainLayer from "@/components/RainLayer";
import {
  ShieldCheck,
  Eye,
  EyeSlash,
  Warning,
  ArrowRight,
  CircleNotch,
  Info,
  Sparkle,
} from "@phosphor-icons/react";

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const loggedUser = await login(email.trim().toLowerCase(), password, "admin");
      if (loggedUser?.role === "admin") {
        nav("/admin/dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = "demo.admin@roadwatch.gov.in";
    const demoPass = "RoadWatch@Demo2026";
    setEmail(demoEmail);
    setPassword(demoPass);
    setBusy(true);
    setErr("");

    try {
      const loggedUser = await login(demoEmail, demoPass, "admin");
      if (loggedUser?.role === "admin") {
        nav("/admin/dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen asphalt-bg overflow-hidden flex items-center justify-center p-6 text-zinc-100">
      <RainLayer count={30} />
      <div className="headlight" />
      <div className="road-lane opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl glass border border-white/10 bg-[#111114]/90 shadow-2xl"
      >
        {/* Breadcrumb: shield icon + / AUTHORITY ADMIN GATE */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 mb-3">
          <ShieldCheck size={16} weight="bold" className="text-amber-400" />
          <span>/ AUTHORITY ADMIN GATE</span>
        </div>

        {/* Title: Administrator Login */}
        <h1 className="font-display font-black text-3xl text-white">
          Administrator Login
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
          Sign in to access the road department admin dashboard.
        </p>

        <form onSubmit={handleManualLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (err) setErr("");
              }}
              placeholder="officer@nhai.gov.in"
              required
              className="mt-1.5 w-full rounded-xl bg-black/50 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (err) setErr("");
                }}
                placeholder="••••••••••••"
                required
                className="w-full rounded-xl bg-black/50 border border-white/10 pl-4 pr-11 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {err && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-start gap-2 font-medium">
              <Warning size={16} className="shrink-0 mt-0.5 text-red-400" />
              <span>{err}</span>
            </div>
          )}

          {/* Primary CTA: Login */}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150 shadow-lg shadow-amber-500/20 cursor-pointer mt-2"
          >
            {busy ? (
              <>
                <CircleNotch size={18} className="animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Demo Admin Account option */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={busy}
            className="w-full py-2.5 rounded-xl border border-white/20 text-zinc-200 hover:bg-white/10 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkle size={15} weight="fill" className="text-amber-400" />
            <span>Use Demo Admin Account</span>
          </button>

          {/* Info banner beneath */}
          <div className="text-[11px] text-amber-300/90 font-mono bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-start gap-2">
            <Info size={15} className="shrink-0 mt-0.5 text-amber-400" />
            <span>This demo account has read-only/sandboxed access for evaluation purposes.</span>
          </div>
        </div>

        {/* Footer linking back to Admin Signup */}
        <div className="mt-6 text-center text-xs text-zinc-400 border-t border-white/10 pt-4">
          Don't have an account?{" "}
          <Link to="/admin/register" className="text-amber-400 hover:text-amber-300 hover:underline font-semibold">
            Sign up here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
