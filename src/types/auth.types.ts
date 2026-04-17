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
  acquisition?: AcquisitionPayload;
}

export interface RegisterEmployeeData {
  name: string;
  email: string;
  phone: string;
  password: string;
  cpf?: string;
  acquisition?: AcquisitionPayload;
}

export interface AcquisitionPayload {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  landing_path?: string;
  referrer?: string;
  captured_at?: string;
}
