import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import RainLayer from "@/components/RainLayer";
import { UserCircle, ShieldStar, Warning, ArrowRight } from "@phosphor-icons/react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState("user"); // 'user' | 'admin'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const u = await login(email.trim().toLowerCase(), password, role);
      nav(u.role === "admin" ? "/dashboard" : "/dashboard");
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
    setBusy(false);
  };

  return (
    <div className="relative min-h-screen asphalt-bg overflow-hidden flex" data-testid="login-page">
      <RainLayer count={40} />
      <div className="road-lane opacity-20" />

      {/* LEFT — Admin */}
      <button
        onClick={() => setRole("admin")}
        data-testid="login-role-admin"
        className={`relative flex-1 min-h-screen flex items-center justify-center transition-opacity ${
          role === "admin" ? "opacity-100" : "opacity-40 hover:opacity-70"
        }`}
      >
        <div className="text-center px-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <ShieldStar size={32} className="text-amber-400" weight="duotone" />
          </div>
          <div className="mt-4 font-display font-black text-3xl">Login as Administration</div>
          <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">
            Authority & control room access. Verify complaints, advance timelines.
          </p>
          {role === "admin" && (
            <div className="mt-4 inline-flex items-center gap-1 text-xs text-amber-400 font-mono">
              ● SELECTED
            </div>
          )}
        </div>
      </button>

      {/* Divider */}
      <div className="w-px bg-white/5" />

      {/* RIGHT — User */}
      <button
        onClick={() => setRole("user")}
        data-testid="login-role-user"
        className={`relative flex-1 min-h-screen flex items-center justify-center transition-opacity ${
          role === "user" ? "opacity-100" : "opacity-40 hover:opacity-70"
        }`}
      >
        <div className="text-center px-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <UserCircle size={32} className="text-amber-400" weight="duotone" />
          </div>
          <div className="mt-4 font-display font-black text-3xl">Login as User</div>
          <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">
            Identify roads, report potholes, track repairs and see the city work.
          </p>
          {role === "user" && (
            <div className="mt-4 inline-flex items-center gap-1 text-xs text-amber-400 font-mono">
              ● SELECTED
            </div>
          )}
        </div>
      </button>

      {/* Center form */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md px-4">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-2xl glass"
          data-testid="login-form"
        >
        <div className="text-[11px] tracking-widest text-amber-400 font-mono">
          / {role === "admin" ? "ADMIN GATE" : "CITIZEN GATE"}
        </div>
        <h1 className="font-display font-black text-3xl mt-1">Welcome back</h1>

        <label className="block mt-6 text-xs text-zinc-400 font-mono">EMAIL</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="login-email"
          placeholder="you@city.gov"
          required
          className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-amber-500/60"
        />

        <label className="block mt-4 text-xs text-zinc-400 font-mono">PASSWORD</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="login-password"
          placeholder="••••••••"
          required
          className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-amber-500/60"
        />

        {err && (
          <div className="mt-4 text-sm text-red-400 flex items-start gap-2" data-testid="login-error">
            <Warning size={16} className="mt-0.5" /> {err}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          data-testid="login-submit"
          className="mt-6 w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? "Signing in..." : <>Enter ROADWATCH <ArrowRight size={16} weight="bold" /></>}
        </button>

        <div className="mt-4 text-center text-xs text-zinc-500">
          New here?{" "}
          <Link to="/register" className="text-amber-400 hover:underline" data-testid="login-register-link">
            Create an account
          </Link>
        </div>
        <div className="mt-2 text-center">
          <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300">← Back to landing</Link>
        </div>
        </motion.form>
      </div>
    </div>
  );
}
