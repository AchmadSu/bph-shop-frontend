import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data.data)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    await api.post("/auth", { email, password }, { withCredentials: true });
    const res = await api.get("/me", { withCredentials: true });
    const newUser = res.data.data;
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    setUser(null);
    document.cookie = "token=; Max-Age=0"; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
