import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthUser, LoginCredentials, RegisterClientData, RegisterEmployeeData } from "@/types/auth.types";
import { authService } from "@/services/auth.service";
import type { LoginResponse } from "@/services/auth.service";

function userWithCondominiumId(data: LoginResponse): AuthUser {
  const id = data.condominium?.id;
  return id ? { ...data.user, condominiumId: id } : data.user;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  registerClient: (data: RegisterClientData) => Promise<void>;
  registerEmployee: (data: RegisterEmployeeData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const data = await authService.loginClient(credentials);
    const stored = userWithCondominiumId(data);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(stored));
    setUser(stored);
  };

  const registerClient = async (data: RegisterClientData): Promise<void> => {
    const res = await authService.registerClient(data);
    const stored = userWithCondominiumId(res);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(stored));
    setUser(stored);
  };

  const registerEmployee = async (data: RegisterEmployeeData): Promise<void> => {
    const res = await authService.registerEmployee(data);
    const stored = userWithCondominiumId(res);
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(stored));
    setUser(stored);
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerClient,
        registerEmployee,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
