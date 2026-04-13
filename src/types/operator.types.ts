export interface Package {
  id: string;
  status: "WAITING_PICKUP" | "DELIVERED";
  recipientName?: string;
  carrier?: string;
  trackingCode?: string;
  photoUrl?: string;
  createdAt: string;
  deliveredAt?: string;
  unit?: { id: string; number: string; block?: string };
}

export interface Unit {
  id: string;
  number: string;
  block?: string;
  condominiumId: string;
}

export interface Courier {
  id: string;
  name: string;
  email: string;
  phone: string;
  token: string;
  condominiumId: string;
}

export interface AccessRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: { id: string; name: string; email: string };
  unit?: Unit;
  createdAt: string;
}

export interface Condominium {
  id: string;
  name: string;
  code: string;
  address?: string;
}

export interface Subscription {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  planName: string;
  expiresAt: string;
  packageCount: number;
  packageLimit: number;
}

/**
 * Resposta de `POST /employee/pickup/find` — mesmo formato que `packageService.findByToken` (Prisma).
 * O token exibível é `code`; dados da encomenda vêm em `pkg`.
 */
export interface EmployeePickupFindResponse {
  id: string;
  packageId: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  usedAt: string | null;
  pkg: {
    id: string;
    description: string;
    photoUrl?: string | null;
    status: "WAITING_PICKUP" | "DELIVERED";
    createdAt: string;
    condominium: { id: string; name: string };
    unit: { id: string; number: string; block?: string | null };
    receiver?: { id: string; name: string; email?: string } | null;
  };
}
