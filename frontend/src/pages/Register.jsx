import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import RainLayer from "@/components/RainLayer";
import { ArrowRight, Warning } from "@phosphor-icons/react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await register(form.email.trim().toLowerCase(), form.password, form.name);
      nav("/dashboard");
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
    setBusy(false);
  };

  return (
    <div className="relative min-h-screen asphalt-bg flex items-center justify-center px-6" data-testid="register-page">
      <RainLayer count={40} />
      <div className="road-lane opacity-20" />
      <form onSubmit={submit} className="relative z-10 w-full max-w-md p-8 rounded-2xl glass">
        <div className="text-[11px] tracking-widest text-amber-400 font-mono">/ NEW CITIZEN</div>
        <h1 className="font-display font-black text-3xl mt-1">Join ROADWATCH</h1>

        <label className="block mt-6 text-xs text-zinc-400 font-mono">NAME</label>
        <input required value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (err) setErr(""); }}
          data-testid="register-name"
          className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-amber-500/60" />

        <label className="block mt-4 text-xs text-zinc-400 font-mono">EMAIL</label>
        <input required type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (err) setErr(""); }}
          data-testid="register-email"
          className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-amber-500/60" />

        <label className="block mt-4 text-xs text-zinc-400 font-mono">PASSWORD</label>
        <input required type="password" minLength={6} value={form.password}
          onChange={(e) => { setForm({ ...form, password: e.target.value }); if (err) setErr(""); }}
          data-testid="register-password"
          className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-amber-500/60" />

        {err && (
          <div className="mt-4 text-sm text-red-400 flex items-start gap-2" data-testid="register-error">
            <Warning size={16} className="mt-0.5" /> {err}
          </div>
        )}

        <button type="submit" disabled={busy} data-testid="register-submit"
          className="mt-6 w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2">
          {busy ? "Creating..." : <>Create Account <ArrowRight size={16} weight="bold" /></>}
        </button>

        <div className="mt-4 text-center text-xs text-zinc-500">
          Have an account?{" "}
          <Link to="/login" className="text-amber-400 hover:underline">Login</Link>
        </div>
      </form>
    </div>
  );
}
