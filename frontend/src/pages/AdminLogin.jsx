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
  const { login, loginSandbox } = useAuth();
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
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message || "Invalid credentials.");
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = "demo.admin@nhai.gov.in";
    const demoPass = "Demo@1234";

    // Auto-fill fields with demo credentials
    setEmail(demoEmail);
    setPassword(demoPass);
    setBusy(true);
    setErr("");

    try {
      let loggedUser = null;
      try {
        loggedUser = await login(demoEmail, demoPass, "admin");
      } catch (firstErr) {
        // Fallback to seeded demo admin account if custom email isn't in DB
        try {
          loggedUser = await login("admin.nhai@roadwatch.demo", "Nhai@Secure2026!", "admin");
        } catch {
          throw firstErr;
        }
      }

      if (loggedUser?.role === "admin") {
        nav("/admin/dashboard");
      } else {
        nav("/dashboard");
      }
    } catch {
      // Backend unavailable or credentials rejected: create clearly-flagged mock/sandbox session
      const sandboxAdmin = {
        id: "demo-admin-sandbox-01",
        email: demoEmail,
        name: "Er. Rajesh Sharma (Demo Admin)",
        role: "admin",
        authority: "NHAI",
        department: "NHAI Regional Corridor Division",
        is_sandbox: true,
      };
      loginSandbox(sandboxAdmin);
      nav("/admin/dashboard");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen asphalt-bg overflow-hidden flex items-center justify-center p-6 text-zinc-100">
      <RainLayer count={35} />
      <div className="road-lane opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg p-8 rounded-2xl glass border border-amber-500/30 shadow-2xl"
      >
        {/* Header: Shield Icon + / AUTHORITY ADMIN GATE */}
        <div className="flex items-center gap-2 text-[11px] tracking-widest text-amber-400 font-mono">
          <ShieldCheck size={16} weight="bold" /> / AUTHORITY ADMIN GATE
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-3xl mt-1 text-white">Administrator Login</h1>

        {/* Subtitle */}
        <p className="text-xs text-zinc-400 mt-1">
          Sign in to access the road department admin dashboard.
        </p>

        {/* Login Form */}
        <form onSubmit={handleManualLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 font-mono uppercase">
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
              className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 font-mono uppercase">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (err) setErr("");
                }}
                placeholder="••••••••••••"
                required
                className="w-full rounded-lg bg-black/60 border border-white/10 pl-4 pr-11 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
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
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
              <Warning size={16} className="shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          {/* Primary CTA: Login */}
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 py-3 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {busy ? (
              <>
                <CircleNotch size={18} className="animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                <span>Login</span> <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Option */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={busy}
            className="w-full py-3 rounded-xl border border-amber-500/50 hover:border-amber-400 bg-black/40 hover:bg-black/60 text-amber-300 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkle size={16} weight="fill" className="text-amber-400" />
            <span>Use Demo Admin Account</span>
          </button>

          {/* Info Banner */}
          <div className="mt-3 text-[11px] text-zinc-400 font-mono bg-black/30 p-2.5 rounded-lg border border-white/5 flex items-start gap-2">
            <Info size={15} className="shrink-0 mt-0.5 text-amber-400" />
            <span>This demo account has read-only/sandboxed access for evaluation purposes.</span>
          </div>
        </div>

        {/* Footer: Don't have an account? Sign up here */}
        <div className="mt-5 text-center text-xs text-zinc-400 border-t border-white/5 pt-4">
          Don't have an account?{" "}
          <Link to="/admin/register" className="text-amber-400 hover:underline font-semibold">
            Sign up here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
