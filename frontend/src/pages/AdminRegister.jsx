import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";
import RainLayer from "@/components/RainLayer";
import { ShieldCheck, Buildings, Key, Warning, ArrowRight, CircleNotch } from "@phosphor-icons/react";

export default function AdminRegister() {
  const { registerAdmin } = useAuth();
  const nav = useNavigate();

  const [authorities, setAuthorities] = useState([
    "NHAI",
    "MCD",
    "PWD",
    "State PWD",
    "Municipal Corporation"
  ]);
  const [authority, setAuthority] = useState("NHAI");
  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/auth/authorities")
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
    <div className="relative min-h-screen asphalt-bg overflow-hidden flex items-center justify-center p-6">
      <RainLayer count={35} />
      <div className="road-lane opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg p-8 rounded-2xl glass border border-amber-500/30 shadow-2xl"
      >
        <div className="flex items-center gap-2 text-[11px] tracking-widest text-amber-400 font-mono">
          <ShieldCheck size={16} weight="bold" /> / AUTHORITY ADMIN GATE
        </div>
        <h1 className="font-display font-black text-3xl mt-1 text-white">Administrator Signup</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Restricted registration for verified road department engineers and municipal officers.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 font-mono uppercase">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (err) setErr(""); }}
              placeholder="Er. Rajesh Sharma"
              required
              className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 font-mono uppercase">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (err) setErr(""); }}
              placeholder="officer@nhai.gov.in"
              required
              className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 font-mono uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (err) setErr(""); }}
              placeholder="••••••••••••"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 font-mono uppercase flex items-center gap-1">
                <Buildings size={14} /> Governing Authority
              </label>
              <select
                value={authority}
                onChange={(e) => { setAuthority(e.target.value); if (err) setErr(""); }}
                className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-3 py-2.5 text-sm text-amber-300 focus:outline-none focus:border-amber-500/60"
              >
                {authorities.map((a) => (
                  <option key={a} value={a} className="bg-[#1a1a1a] text-white">
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 font-mono uppercase flex items-center gap-1">
                <Key size={14} /> Authority Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => { setInviteCode(e.target.value); if (err) setErr(""); }}
                placeholder="NHAI-CORRIDOR-..."
                required
                className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-amber-400 font-mono uppercase focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono bg-black/30 p-2.5 rounded-lg border border-white/5">
            ⓘ A valid secret invite code issued by your department coordinator is mandatory to verify your agency affiliation.
          </div>

          {err && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
              <Warning size={16} className="shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 py-3 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            {busy ? (
              <>
                <CircleNotch size={18} className="animate-spin" /> Verifying Invite Code...
              </>
            ) : (
              <>
                Create Administrator Account <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-zinc-400 border-t border-white/5 pt-4">
          Already registered?{" "}
          <Link to="/login" className="text-amber-400 hover:underline font-semibold">
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
