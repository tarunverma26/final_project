import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import RainLayer from "@/components/RainLayer";
import {
  UserCircle,
  ShieldStar,
  ShieldCheck,
  Warning,
  ArrowRight,
} from "@phosphor-icons/react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const loggedUser = await login(email.trim().toLowerCase(), password, role);
      if (loggedUser?.role === "admin") {
        nav("/admin/dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
    setBusy(false);
  };

  return (
    <div
      className="relative min-h-screen asphalt-bg overflow-hidden flex items-center justify-center p-6 text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200"
      data-testid="login-page"
    >
      {/* Ambient background atmosphere matching Civic Events / dark theme */}
      <RainLayer count={35} />
      <div className="road-lane opacity-20" />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid md:grid-cols-[1fr_minmax(340px,460px)_1fr] items-center gap-6 md:gap-8 py-12 md:py-20">

        {/* LEFT — Admin Quick Portal */}
        <RolePanel
          testid="login-role-admin"
          active={role === "admin"}
          onClick={() => setRole("admin")}
          Icon={ShieldStar}
          title="Administrator Access"
          sub="Official government portal for NHAI, PWD & MCD engineers."
        />

        {/* CENTER — Login Form */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-8 rounded-2xl bg-[#141416]/95 border border-white/10 shadow-2xl backdrop-blur-md w-full order-first md:order-none"
          data-testid="login-form"
        >
          {/* Gate Pill Header */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 mb-2">
            <ShieldCheck size={15} weight="bold" className="text-amber-400" />
            <span>/ {role === "admin" ? "AUTHORITY ADMIN GATE" : "CITIZEN ACCESS GATE"}</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl text-white mt-1">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Sign in to manage reports, explore telemetry, and track repairs.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (err) setErr("");
                }}
                data-testid="login-email"
                placeholder={role === "admin" ? "officer@nhai.gov.in" : "citizen@roadwatch.dev"}
                required
                className="mt-1.5 w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (err) setErr("");
                }}
                data-testid="login-password"
                placeholder="••••••••••••"
                required
                className="mt-1.5 w-full rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-medium"
              />
            </div>
          </div>

          {err && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-start gap-2 font-medium" data-testid="login-error">
              <Warning size={16} className="mt-0.5 shrink-0 text-red-400" />
              <span>{err}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            data-testid="login-submit"
            className="mt-6 w-full py-3.5 rounded-xl bg-[#F97316] text-white font-semibold text-sm hover:bg-[#EA580C] disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150 shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            {busy ? (
              "Signing in..."
            ) : (
              <>
                <span>Sign In to ROADWATCH</span> <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>

          {/* Links Section */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-zinc-400">
            {role === "admin" ? (
              <div>
                Need authority officer access?{" "}
                <Link
                  to="/admin/register"
                  className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                  data-testid="login-admin-register-link"
                >
                  Register as Administrator
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div>
                  New citizen?{" "}
                  <Link
                    to="/register"
                    className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                    data-testid="login-register-link"
                  >
                    Create a free account
                  </Link>
                </div>
                <div>
                  Authority engineer or municipal officer?{" "}
                  <Link
                    to="/admin/register"
                    className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                    data-testid="login-admin-register-link"
                  >
                    Register as Administrator
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Switch to dedicated Administrator Portal & Demo Account */}
          <div className="mt-3 text-center">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-teal-400 hover:text-teal-300 hover:underline transition-colors"
              data-testid="switch-admin-login-link"
            >
              <span>Switch to dedicated Administrator Portal & Demo Account</span>
              <ArrowRight size={13} weight="bold" />
            </Link>
          </div>

          {/* Back to public landing */}
          <div className="mt-3 text-center">
            <Link to="/" className="text-xs text-zinc-400 hover:text-white font-medium transition-colors">
              ← Back to public landing
            </Link>
          </div>
        </motion.form>

        {/* RIGHT — Citizen User Panel */}
        <RolePanel
          testid="login-role-user"
          active={role === "user"}
          onClick={() => setRole("user")}
          Icon={UserCircle}
          title="Citizen Access"
          sub="Identify roads, report potholes, and track civic repairs in the open."
        />
      </div>
    </div>
  );
}

function RolePanel({ active, onClick, Icon, title, sub, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      type="button"
      className={`text-center p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
        active
          ? "border-2 border-[#F97316] bg-[#141416]/95 shadow-xl shadow-orange-500/10 ring-2 ring-[#F97316]/20 opacity-100"
          : "border-white/10 bg-[#141416]/70 hover:bg-[#141416]/90 hover:border-white/20 opacity-75 hover:opacity-100 shadow-md"
      }`}
    >
      <div
        className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border transition-colors ${
          active
            ? "bg-orange-500/15 border-orange-500/30 text-[#F97316]"
            : "bg-white/5 border-white/10 text-zinc-400"
        }`}
      >
        <Icon size={26} weight={active ? "duotone" : "regular"} />
      </div>
      <div className="mt-3 font-display font-bold text-lg text-white">{title}</div>
      <p className="text-xs text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">{sub}</p>
      <div
        className={`mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border transition-colors ${
          active
            ? "bg-orange-500/15 text-[#F97316] border-orange-500/30"
            : "bg-white/5 text-zinc-400 border-white/10"
        }`}
      >
        ● {active ? "SELECTED ROLE" : "CLICK TO SWITCH"}
      </div>
    </button>
  );
}
