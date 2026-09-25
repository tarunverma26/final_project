import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { ArrowRight, Warning, UserPlus } from "@phosphor-icons/react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await register(form.email.trim().toLowerCase(), form.password, form.name);
      nav("/dashboard");
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
    setBusy(false);
  };

  return (
    <div
      className="relative min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-16 overflow-hidden"
      data-testid="register-page"
    >
      <WeatherAtmosphere rainCount={25} showClouds={true} showSun={true} />

      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#EA580C] bg-orange-50 border border-orange-200/80 mb-2">
          <UserPlus size={15} weight="bold" className="text-[#F97316]" />
          <span>/ NEW CITIZEN ONBOARDING</span>
        </div>

        <h1 className="font-display font-extrabold text-3xl text-[#12304A]">
          Join ROADWATCH
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Document roads, submit verified reports, and track civic repairs in the open.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#12304A] font-mono uppercase tracking-wider">
              FULL NAME
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (err) setErr("");
              }}
              placeholder="Aarav Sharma"
              data-testid="register-name"
              className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#12304A] font-mono uppercase tracking-wider">
              EMAIL ADDRESS
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (err) setErr("");
              }}
              placeholder="aarav@gmail.com"
              data-testid="register-email"
              className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#12304A] font-mono uppercase tracking-wider">
              PASSWORD (MIN 6 CHARS)
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (err) setErr("");
              }}
              placeholder="••••••••••••"
              data-testid="register-password"
              className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
            />
          </div>
        </div>

        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-start gap-2 font-medium" data-testid="register-error">
            <Warning size={16} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          data-testid="register-submit"
          className="mt-6 w-full py-3.5 rounded-xl bg-[#F97316] text-white font-semibold text-sm hover:bg-[#EA580C] disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150 shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
        >
          {busy ? "Creating account..." : <><span>Create Account</span> <ArrowRight size={16} weight="bold" /></>}
        </button>

        <div className="mt-5 pt-4 border-t border-[#F1F5F9] text-center text-xs text-[#64748B]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#F97316] font-semibold hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
