import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "engineer" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (data: Omit<User, "id"> & { password: string }) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("eng_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const signup = (data: Omit<User, "id"> & { password: string }) => {
    const newUser: User = { ...data, id: crypto.randomUUID() };
    const users = JSON.parse(localStorage.getItem("eng_users") || "[]");
    users.push({ ...newUser, password: data.password });
    localStorage.setItem("eng_users", JSON.stringify(users));
    localStorage.setItem("eng_user", JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const login = (email: string, password: string) => {
    // Admin shortcut
    if (email === "admin@eng.com" && password === "admin123") {
      const admin: User = { id: "admin", name: "المدير", email, phone: "", role: "admin" };
      localStorage.setItem("eng_user", JSON.stringify(admin));
      setUser(admin);
      return true;
    }
    const users = JSON.parse(localStorage.getItem("eng_users") || "[]");
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      localStorage.setItem("eng_user", JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("eng_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};
