import { api } from "./api";
import type { AuthUser, LoginCredentials, RegisterClientData, RegisterEmployeeData } from "@/types/auth.types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
  condominium?: { id: string; name: string } | null;
}

export const authService = {
  loginClient: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  registerClient: async (data: RegisterClientData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/client/register", data);
    return response.data;
  },

  registerEmployee: async (data: RegisterEmployeeData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/employee/register", data);
    return response.data;
  },

  checkCpf: async (cpf: string): Promise<{ exists: boolean }> => {
    const response = await api.get<{ exists: boolean }>(`/auth/check-user-cpf?cpf=${cpf}`);
    return response.data;
  },

  validatePasswordRecovery: async (data: {
    cpf: string;
    email?: string;
    phone?: string;
  }): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>("/auth/validate-password-recovery", data);
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    password: string;
  }): Promise<void> => {
    await api.post("/auth/reset-password", data);
  },
};
