import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { ShieldCheck, Buildings, Key, Warning, ArrowRight, CircleNotch, Info } from "@phosphor-icons/react";

export default function AdminRegister() {
  const { registerAdmin } = useAuth();
  const nav = useNavigate();

  const [authorities, setAuthorities] = useState([
    "NHAI",
    "MCD",
    "PWD",
    "State PWD",
    "Municipal Corporation",
  ]);
  const [authority, setAuthority] = useState("NHAI");
  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/auth/authorities")
      .then((res) => {
        if (res.data?.authorities?.length) {
          setAuthorities(res.data.authorities);
          if (!res.data.authorities.includes(authority)) {
            setAuthority(res.data.authorities[0]);
          }
        }
      })
      .catch(() => {});
  }, [authority]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await registerAdmin({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        authority,
        invite_code: inviteCode.trim(),
      });
      nav("/admin/dashboard");
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
        className="relative z-10 w-full max-w-lg p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg"
      >
        {/* Breadcrumb: shield icon + / AUTHORITY ADMIN GATE in orange on white background */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#EA580C] bg-orange-50 border border-orange-200/80 mb-3">
          <ShieldCheck size={16} weight="bold" className="text-[#F97316]" />
          <span>/ AUTHORITY ADMIN GATE</span>
        </div>

        {/* Title in navy, bold */}
        <h1 className="font-display font-extrabold text-3xl text-[#12304A]">
          Administrator Signup
        </h1>
        {/* Subtitle in secondary text gray #64748B */}
        <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">
          Restricted registration for verified road department engineers and municipal authority coordinators.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#12304A] uppercase tracking-wider font-mono">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (err) setErr("");
              }}
              placeholder="Er. Rajesh Sharma"
              required
              className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
            />
          </div>

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
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (err) setErr("");
              }}
              placeholder="••••••••••••"
              required
              minLength={6}
              className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#12304A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all font-medium"
            />
          </div>

          {/* Governing Authority & Invite Code side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#12304A] uppercase tracking-wider font-mono flex items-center gap-1">
                <Buildings size={14} className="text-[#0F766E]" /> Governing Authority
              </label>
              <select
                value={authority}
                onChange={(e) => {
                  setAuthority(e.target.value);
                  if (err) setErr("");
                }}
                className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#12304A] font-semibold focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all"
              >
                {authorities.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12304A] uppercase tracking-wider font-mono flex items-center gap-1">
                <Key size={14} className="text-[#0F766E]" /> Authority Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  if (err) setErr("");
                }}
                placeholder="NHAI-CORRIDOR-..."
                required
                className="mt-1.5 w-full rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#0F766E] font-mono font-bold uppercase focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          {/* Info Banner: light teal-tinted card with subtle border */}
          <div className="text-xs text-[#0F766E] font-mono bg-teal-50/70 p-3 rounded-xl border border-teal-200 flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>A valid secret invite code issued by your department coordinator is mandatory to verify your agency affiliation.</span>
          </div>

          {err && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-start gap-2 font-medium">
              <Warning size={16} className="shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          {/* Primary CTA in orange filled button, white text */}
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 py-3.5 rounded-xl bg-[#F97316] text-white font-semibold text-sm hover:bg-[#EA580C] disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150 shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
          >
            {busy ? (
              <>
                <CircleNotch size={18} className="animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <span>Create Administrator Account</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Footer: Already registered? Login here -> links to /admin/login */}
        <div className="mt-6 text-center text-xs text-[#64748B] border-t border-[#F1F5F9] pt-4">
          Already registered?{" "}
          <Link to="/admin/login" className="text-[#F97316] hover:text-[#EA580C] hover:underline font-semibold">
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
