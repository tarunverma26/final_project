import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
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
    <div className="relative min-h-screen bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-6">
      <WeatherAtmosphere rainCount={25} showClouds={true} showSun={true} />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg"
      >
        {/* Breadcrumb: shield icon + / AUTHORITY ADMIN GATE in orange on white background */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#EA580C] bg-orange-50 border border-orange-200/80 mb-3">
          <ShieldCheck size={16} weight="bold" className="text-[#F97316]" />
          <span>/ AUTHORITY ADMIN GATE</span>
        </div>

        {/* Title: Administrator Login (navy, bold) */}
        <h1 className="font-display font-extrabold text-3xl text-[#12304A]">
          Administrator Login
        </h1>

        {/* Subtitle in secondary text gray #64748B */}
        <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">
          Sign in to access the road department admin dashboard.
        </p>

        <form onSubmit={handleManualLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#12304A] uppercase tracking-wider font-mono">
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
              className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#12304A] uppercase tracking-wider font-mono">
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
                className="w-full rounded-xl bg-white border border-[#E2E8F0] pl-4 pr-11 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#12304A] transition-colors p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {err && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-start gap-2 font-medium">
              <Warning size={16} className="shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          {/* Primary CTA: Login → (orange filled button, full width) */}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-xl bg-[#F97316] text-white font-semibold text-sm hover:bg-[#EA580C] disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150 shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer mt-2"
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
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-3">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={busy}
            className="w-full py-2.5 rounded-xl border border-[#12304A] text-[#12304A] hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkle size={15} weight="fill" className="text-[#F97316]" />
            <span>Use Demo Admin Account</span>
          </button>

          {/* Small info banner beneath */}
          <div className="text-[11px] text-[#0F766E] font-mono bg-teal-50/70 p-2.5 rounded-xl border border-teal-200 flex items-start gap-2">
            <Info size={15} className="shrink-0 mt-0.5" />
            <span>This demo account has read-only/sandboxed access for evaluation purposes.</span>
          </div>
        </div>

        {/* Footer linking back to Admin Signup */}
        <div className="mt-6 text-center text-xs text-[#64748B] border-t border-[#F1F5F9] pt-4">
          Don't have an account?{" "}
          <Link to="/admin/register" className="text-[#F97316] hover:text-[#EA580C] hover:underline font-semibold">
            Sign up here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
