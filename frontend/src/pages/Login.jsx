import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
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
    <div className="relative min-h-screen bg-[#F8FAFC] overflow-hidden" data-testid="login-page">
      <WeatherAtmosphere rainCount={30} showClouds={true} showSun={true} />

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-[1fr_minmax(340px,460px)_1fr] items-center gap-6 md:gap-8 px-6 py-20">

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
            className="p-6 md:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg w-full order-first md:order-none"
            data-testid="login-form"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#EA580C] bg-orange-50 border border-orange-200/80 mb-2">
              <ShieldCheck size={15} weight="bold" className="text-[#F97316]" />
              <span>/ {role === "admin" ? "AUTHORITY ADMIN GATE" : "CITIZEN ACCESS GATE"}</span>
            </div>
            
            <h1 className="font-display font-extrabold text-3xl text-[#12304A] mt-1">
              Welcome back
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Sign in to manage reports, explore telemetry, and track repairs.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#12304A] font-mono uppercase tracking-wider">
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
                  className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#12304A] font-mono uppercase tracking-wider">
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
                  className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                />
              </div>
            </div>

            {err && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-start gap-2 font-medium" data-testid="login-error">
                <Warning size={16} className="mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              data-testid="login-submit"
              className="mt-6 w-full py-3.5 rounded-xl bg-[#F97316] text-white font-semibold text-sm hover:bg-[#EA580C] disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150 shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
            >
              {busy ? (
                "Signing in..."
              ) : (
                <>
                  <span>Sign In to ROADWATCH</span> <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>

            {/* Links section */}
            <div className="mt-5 pt-4 border-t border-[#F1F5F9] text-center text-xs text-[#64748B]">
              {role === "admin" ? (
                <div>
                  Need authority officer access?{" "}
                  <Link
                    to="/admin/register"
                    className="text-[#F97316] font-semibold hover:underline"
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
                      className="text-[#F97316] font-semibold hover:underline"
                      data-testid="login-register-link"
                    >
                      Create a free account
                    </Link>
                  </div>
                  <div>
                    Authority engineer or municipal officer?{" "}
                    <Link
                      to="/admin/register"
                      className="text-[#F97316] font-semibold hover:underline"
                      data-testid="login-admin-register-link"
                    >
                      Register as Administrator
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Switch to dedicated Administrator Portal & Demo Account link (always visible) */}
            <div className="mt-3 text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#0F766E] hover:text-[#0D625B] hover:underline transition-colors"
                data-testid="switch-admin-login-link"
              >
                <span>Switch to dedicated Administrator Portal & Demo Account</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>

            {/* Back to public landing */}
            <div className="mt-3 text-center">
              <Link to="/" className="text-xs text-[#64748B] hover:text-[#12304A] font-medium">
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
    </div>
  );
}

function RolePanel({ active, onClick, Icon, title, sub, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      type="button"
      className={`text-center px-5 py-7 rounded-2xl border transition-all duration-150 cursor-pointer ${
        active
          ? "border-2 border-[#F97316] bg-white shadow-md ring-4 ring-orange-50 opacity-100"
          : "border-[#E2E8F0] bg-white/70 hover:bg-white hover:border-slate-300 opacity-80 hover:opacity-100 shadow-2xs"
      }`}
    >
      <div
        className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border ${
          active
            ? "bg-orange-50 border-orange-200 text-[#F97316]"
            : "bg-slate-100 border-slate-200 text-[#64748B]"
        }`}
      >
        <Icon size={26} weight={active ? "duotone" : "regular"} />
      </div>
      <div className="mt-3 font-display font-bold text-lg text-[#12304A]">{title}</div>
      <p className="text-xs text-[#64748B] mt-1.5 max-w-xs mx-auto leading-relaxed">{sub}</p>
      <div
        className={`mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
          active
            ? "bg-orange-50 text-[#EA580C] border border-orange-200"
            : "bg-slate-100 text-[#64748B]"
        }`}
      >
        ● {active ? "SELECTED ROLE" : "CLICK TO SWITCH"}
      </div>
    </button>
  );
}
