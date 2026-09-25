import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  Radioactive as Radar,
  MapTrifold,
  Article,
  Calendar,
  HardHat,
  SignIn,
  SignOut,
  List,
  X,
  ShieldCheck,
  CaretDown,
  Path,
  WarningCircle,
  ChatText,
  Sparkle,
} from "@phosphor-icons/react";

const links = [
  { to: "/identify", label: "Identify Road", icon: Radar },
  { to: "/report", label: "Report", icon: Article },
  { to: "/map", label: "Map", icon: MapTrifold },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/contractors", label: "Contractors", icon: HardHat },
];

const smartLinks = [
  {
    to: "/#route-health",
    anchor: "route-health",
    label: "Route Health",
    desc: "Condition-aware fleet navigation",
    icon: Path,
  },
  {
    to: "/#stress-index",
    anchor: "stress-index",
    label: "Stress Index",
    desc: "Compound ward vulnerability score",
    icon: WarningCircle,
  },
  {
    to: "/#sms-reporting",
    anchor: "sms-reporting",
    label: "SMS Hotline",
    desc: "Low-data & feature phone reporting",
    icon: ChatText,
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [smartOpen, setSmartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const smartDropdownRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 15);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (smartDropdownRef.current && !smartDropdownRef.current.contains(e.target)) {
        setSmartOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAnchorClick = (e, anchor, to) => {
    setSmartOpen(false);
    setOpen(false);

    if (location.pathname === "/") {
      e.preventDefault();
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      nav(to);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isHeroNav = location.pathname === "/" && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-[#E2E8F0] shadow-sm py-2.5"
          : isHeroNav
          ? "bg-[#081120]/75 backdrop-blur-md border-white/10 py-3.5"
          : "bg-white border-[#E2E8F0] py-3.5"
      }`}
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Brand Logo: ROAD in White/Navy, WATCH in Orange #F97316 */}
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
          <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <Radar size={18} weight="bold" className="text-white" />
          </div>
          <span className="font-display font-extrabold tracking-tight text-xl">
            <span className={isHeroNav ? "text-white" : "text-[#12304A]"}>ROAD</span>
            <span className="text-[#F97316]">WATCH</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? isHeroNav
                      ? "text-[#F97316] bg-orange-500/20 border border-orange-500/30 font-semibold"
                      : "text-[#F97316] bg-orange-50 font-semibold"
                    : isHeroNav
                    ? "text-slate-200 hover:text-white hover:bg-white/10"
                    : "text-[#64748B] hover:text-[#12304A] hover:bg-slate-50"
                }`}
              >
                <Icon
                  size={16}
                  weight={active ? "bold" : "duotone"}
                  className={active ? "text-[#F97316]" : isHeroNav ? "text-slate-300" : "text-[#64748B]"}
                />
                {label}
              </Link>
            );
          })}

          {/* Smart Layer Dropdown */}
          <div className="relative" ref={smartDropdownRef}>
            <button
              onClick={() => setSmartOpen((v) => !v)}
              data-testid="nav-smart-layer-btn"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                smartOpen
                  ? isHeroNav
                    ? "bg-teal-950/80 text-teal-200 border border-teal-500/40"
                    : "bg-teal-50 text-[#0F766E] border border-teal-200"
                  : isHeroNav
                  ? "text-teal-300 hover:bg-white/10"
                  : "text-[#0F766E] hover:bg-teal-50/70"
              }`}
            >
              <Sparkle size={15} weight="fill" className={isHeroNav ? "text-teal-300" : "text-[#0F766E]"} />
              <span>Smart Layer</span>
              <CaretDown
                size={12}
                className={`transition-transform duration-200 ${isHeroNav ? "text-teal-300" : "text-[#0F766E]"} ${
                  smartOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Smart Layer Popover */}
            {smartOpen && (
              <div
                className="absolute top-full mt-2 left-0 w-72 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                data-testid="smart-layer-menu"
              >
                <div className="px-3 py-1.5 text-[10px] font-mono text-[#64748B] uppercase tracking-wider font-semibold">
                  INTELLIGENCE & SIGNALS
                </div>
                {smartLinks.map(({ to, anchor, label, desc, icon: Icon }) => (
                  <a
                    key={to}
                    href={to}
                    onClick={(e) => handleAnchorClick(e, anchor, to)}
                    data-testid={`nav-smart-${anchor}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] shrink-0 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                      <Icon size={16} weight="duotone" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#12304A] group-hover:text-[#0F766E] transition-colors">
                        {label}
                      </div>
                      <div className="text-xs text-[#64748B] leading-snug">
                        {desc}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* User Auth and Action Controls */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  data-testid="nav-admin-dashboard-btn"
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition ${
                    isHeroNav
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      : "bg-slate-100 hover:bg-slate-200 text-[#12304A] border-[#E2E8F0]"
                  }`}
                >
                  <ShieldCheck size={14} weight="bold" className="text-[#0F766E]" />
                  <span>{user.authority || "Admin Portal"}</span>
                </Link>
              )}
              <Link
                to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                data-testid="nav-dashboard-btn"
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  isHeroNav
                    ? "text-white hover:bg-white/10"
                    : "text-[#12304A] hover:bg-slate-100"
                }`}
              >
                {user.name.split(" ")[0]}
              </Link>

              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                data-testid="nav-logout-btn"
                className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  isHeroNav
                    ? "bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border-white/20"
                    : "bg-slate-100 hover:bg-slate-200 text-[#64748B] hover:text-[#0F172A] border-[#E2E8F0]"
                }`}
              >
                <SignOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              data-testid="nav-login-btn"
              className="text-sm px-4 py-2 rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] font-semibold transition-all duration-150 flex items-center gap-1.5 shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
            >
              <SignIn size={16} weight="bold" /> Login
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setOpen((v) => !v)}
            data-testid="nav-mobile-toggle"
            className={`md:hidden ml-1 p-2 rounded-lg border transition-colors ${
              isHeroNav
                ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                : "bg-slate-100 hover:bg-slate-200 text-[#12304A] border-[#E2E8F0]"
            }`}
            aria-label="Toggle navigation"
          >
            {open ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div
          className="md:hidden border-t border-[#E2E8F0] bg-white shadow-lg animate-in fade-in slide-in-from-top-2"
          data-testid="mobile-menu"
        >
          <nav className="max-w-7xl mx-auto flex flex-col p-4 gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  data-testid={`nav-mobile-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    active
                      ? "text-[#F97316] bg-orange-50 font-semibold"
                      : "text-[#64748B] hover:text-[#12304A] hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} weight="duotone" /> {label}
                </Link>
              );
            })}

            {/* Smart Layer Anchor Section */}
            <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
              <div className="px-3 py-1 text-[11px] font-mono text-[#0F766E] font-semibold uppercase tracking-wider">
                SMART LAYER SECTIONS
              </div>
              {smartLinks.map(({ to, anchor, label, icon: Icon }) => (
                <a
                  key={to}
                  href={to}
                  onClick={(e) => handleAnchorClick(e, anchor, to)}
                  data-testid={`nav-mobile-${anchor}`}
                  className="px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:text-[#0F766E] hover:bg-teal-50 flex items-center gap-2"
                >
                  <Icon size={16} weight="duotone" className="text-[#0F766E]" /> {label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
