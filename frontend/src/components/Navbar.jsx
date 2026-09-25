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
  const smartDropdownRef = useRef(null);

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

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 glass"
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
          <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Radar size={18} weight="bold" className="text-black" />
          </div>
          <span className="font-display font-black tracking-tight text-lg">
            ROAD<span className="text-amber-400">WATCH</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Preserved Original 5 Links in Exact Order */}
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-3 py-2 rounded-md text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <Icon size={16} weight="duotone" />
              {label}
            </Link>
          ))}

          {/* New Anchor Links: Smart Layer Dropdown */}
          <div className="relative" ref={smartDropdownRef}>
            <button
              onClick={() => setSmartOpen((v) => !v)}
              data-testid="nav-smart-layer-btn"
              className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1.5 font-medium ${
                smartOpen
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10"
              }`}
            >
              <Sparkle size={15} weight="fill" className="text-amber-400" />
              Smart Layer
              <CaretDown
                size={12}
                className={`transition-transform duration-200 ${smartOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Smart Layer Popover */}
            {smartOpen && (
              <div
                className="absolute top-full mt-2 left-0 w-72 rounded-2xl bg-[#121216] border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-2xl"
                data-testid="smart-layer-menu"
              >
                <div className="px-3 py-2 text-[10px] font-mono text-zinc-500 tracking-wider">
                  INTELLIGENCE & SIGNALS
                </div>
                {smartLinks.map(({ to, anchor, label, desc, icon: Icon }) => (
                  <a
                    key={to}
                    href={to}
                    onClick={(e) => handleAnchorClick(e, anchor, to)}
                    data-testid={`nav-smart-${anchor}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon size={16} weight="duotone" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {label}
                      </div>
                      <div className="text-xs text-zinc-400 leading-snug">
                        {desc}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* User Auth and CTA Controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  data-testid="nav-admin-dashboard-btn"
                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-medium flex items-center gap-1.5 transition"
                >
                  <ShieldCheck size={14} weight="bold" />
                  {user.authority || "Admin Portal"}
                </Link>
              )}
              <Link
                to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                data-testid="nav-dashboard-btn"
                className="text-sm px-3 py-2 rounded-md text-amber-300 hover:bg-white/5"
              >
                {user.name.split(" ")[0]}
              </Link>

              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                data-testid="nav-logout-btn"
                className="text-sm px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 flex items-center gap-1.5"
              >
                <SignOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              data-testid="nav-login-btn"
              className="text-sm px-4 py-2 rounded-md bg-amber-500 text-black hover:bg-amber-400 font-medium transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <SignIn size={16} weight="bold" /> Login
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setOpen((v) => !v)}
            data-testid="nav-mobile-toggle"
            className="md:hidden ml-1 p-2 rounded-md bg-white/5 hover:bg-white/10"
            aria-label="Toggle navigation"
          >
            {open ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div
          className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl"
          data-testid="mobile-menu"
        >
          <nav className="max-w-7xl mx-auto flex flex-col p-4 gap-1">
            {/* Preserved Original 5 Links */}
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                data-testid={`nav-mobile-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-2.5 rounded-md text-sm text-zinc-200 hover:bg-white/5 flex items-center gap-2"
              >
                <Icon size={16} weight="duotone" /> {label}
              </Link>
            ))}

            {/* Smart Layer Anchor Section */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="px-3 py-1 text-[11px] font-mono text-amber-400 tracking-wider">
                / SMART LAYER ANCHORS
              </div>
              {smartLinks.map(({ to, anchor, label, icon: Icon }) => (
                <a
                  key={to}
                  href={to}
                  onClick={(e) => handleAnchorClick(e, anchor, to)}
                  data-testid={`nav-mobile-${anchor}`}
                  className="px-3 py-2.5 rounded-md text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                >
                  <Icon size={16} weight="duotone" className="text-amber-400" /> {label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
