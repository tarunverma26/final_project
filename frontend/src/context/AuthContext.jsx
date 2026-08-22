import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("rw_token");
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("rw_token");
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  const login = async (email, password, role = "user") => {
    const { data } = await api.post("/auth/login", { email, password, role });
    localStorage.setItem("rw_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const register = async (email, password, name) => {
    const { data } = await api.post("/auth/register", { email, password, name });
    localStorage.setItem("rw_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => { localStorage.removeItem("rw_token"); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
