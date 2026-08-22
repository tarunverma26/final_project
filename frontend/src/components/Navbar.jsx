import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Radioactive as Radar, MapTrifold, Article, Calendar, HardHat, SignIn, SignOut, List, X,
} from "@phosphor-icons/react";

const links = [
  { to: "/identify", label: "Identify Road", icon: Radar },
  { to: "/report", label: "Report", icon: Article },
  { to: "/map", label: "Map", icon: MapTrifold },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/contractors", label: "Contractors", icon: HardHat },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 glass"
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
          <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center">
            <Radar size={18} weight="bold" className="text-black" />
          </div>
          <span className="font-display font-black tracking-tight text-lg">
            ROAD<span className="text-amber-400">WATCH</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
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
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                data-testid="nav-dashboard-btn"
                className="text-sm px-3 py-2 rounded-md text-amber-300 hover:bg-white/5"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => { logout(); nav("/"); }}
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
              className="text-sm px-4 py-2 rounded-md bg-amber-500 text-black hover:bg-amber-400 font-medium transition-colors flex items-center gap-1.5"
            >
              <SignIn size={16} weight="bold" /> Login
            </Link>
          )}
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

      {open && (
        <div className="md:hidden border-t border-white/5 bg-black/80 backdrop-blur-xl" data-testid="mobile-menu">
          <nav className="max-w-7xl mx-auto flex flex-col p-4 gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                data-testid={`nav-mobile-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-3 rounded-md text-sm text-zinc-200 hover:bg-white/5 flex items-center gap-2"
              >
                <Icon size={16} weight="duotone" /> {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
