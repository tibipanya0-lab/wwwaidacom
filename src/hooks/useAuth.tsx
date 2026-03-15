import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type AdminUser = {
  email: string;
  token: string;
};

type AuthContextType = {
  user: AdminUser | null;
  session: null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AUTH_KEY = "inaya_admin_token";
const AUTH_EMAIL_KEY = "inaya_admin_email";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    const email = localStorage.getItem(AUTH_EMAIL_KEY);
    if (token && email) {
      setUser({ email, token });
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { error: new Error(data.detail || "Hibás email vagy jelszó") };
      }
      const data = await res.json();
      const token = data.access_token;
      localStorage.setItem(AUTH_KEY, token);
      localStorage.setItem(AUTH_EMAIL_KEY, email);
      setUser({ email, token });
      return { error: null };
    } catch (e) {
      return { error: new Error("Hálózati hiba") };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_EMAIL_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session: null, isAdmin: !!user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
