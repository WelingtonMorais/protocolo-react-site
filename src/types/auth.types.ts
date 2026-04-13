export type UserRole = "CLIENT" | "EMPLOYEE" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  condominiumId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterClientData {
  name: string;
  email: string;
  phone: string;
  password: string;
  cpf?: string;
}

export interface RegisterEmployeeData {
  name: string;
  email: string;
  phone: string;
  password: string;
  cpf?: string;
}
