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
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
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
    <div className="relative min-h-screen asphalt-bg overflow-hidden" data-testid="login-page">
      <RainLayer count={40} />
      <div className="road-lane opacity-20" />

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-[1fr_minmax(320px,440px)_1fr] items-center gap-6 md:gap-10 px-6 py-24">

          {/* LEFT — Admin */}
          <RolePanel
            testid="login-role-admin"
            active={role === "admin"}
            onClick={() => setRole("admin")}
            Icon={ShieldStar}
            title="Login as Administration"
            sub="Authority & control room access. Verify complaints, advance timelines."
          />

          {/* CENTER — Form */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 md:p-8 rounded-2xl glass w-full order-first md:order-none"
            data-testid="login-form"
          >
            <div className="text-[11px] tracking-widest text-amber-400 font-mono">
              / {role === "admin" ? "ADMIN GATE" : "CITIZEN GATE"}
            </div>
            <h1 className="font-display font-black text-3xl mt-1">Welcome back</h1>

            <label className="block mt-5 text-xs text-zinc-400 font-mono">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (err) setErr(""); }}
              data-testid="login-email"
              placeholder="you@city.gov"
              required
              className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-amber-500/60"
            />

            <label className="block mt-4 text-xs text-zinc-400 font-mono">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (err) setErr(""); }}
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

            <div className="mt-4 text-center text-xs text-zinc-400">
              {role === "admin" ? (
                <>
                  Need authority officer access?{" "}
                  <Link to="/admin/register" className="text-amber-400 font-semibold hover:underline" data-testid="login-admin-register-link">
                    Register as Administrator
                  </Link>
                </>
              ) : (
                <>
                  New citizen?{" "}
                  <Link to="/register" className="text-amber-400 hover:underline" data-testid="login-register-link">
                    Create an account
                  </Link>
                </>
              )}
            </div>

            <div className="mt-2 text-center">
              <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300">← Back to landing</Link>
            </div>
          </motion.form>

          {/* RIGHT — User */}
          <RolePanel
            testid="login-role-user"
            active={role === "user"}
            onClick={() => setRole("user")}
            Icon={UserCircle}
            title="Login as User"
            sub="Identify roads, report potholes, track repairs and see the city work."
          />
        </div>
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
      className={`text-center px-4 py-6 rounded-2xl border transition-all ${
        active
          ? "border-amber-500/50 bg-amber-500/5 opacity-100"
          : "border-white/5 opacity-60 hover:opacity-90 hover:border-white/20"
      }`}
    >
      <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border ${
        active ? "bg-amber-500/10 border-amber-500/40" : "bg-white/5 border-white/10"
      }`}>
        <Icon size={28} className={active ? "text-amber-400" : "text-zinc-400"} weight="duotone" />
      </div>
      <div className="mt-3 font-display font-black text-xl md:text-2xl">{title}</div>
      <p className="text-xs md:text-sm text-zinc-500 mt-2 max-w-xs mx-auto">{sub}</p>
      <div className={`mt-3 inline-flex items-center gap-1 text-[10px] font-mono ${
        active ? "text-amber-400" : "text-zinc-600"
      }`}>
        ● {active ? "SELECTED" : "CLICK TO SELECT"}
      </div>
    </button>
  );
}
