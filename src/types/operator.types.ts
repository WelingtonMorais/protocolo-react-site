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

export interface PickupFindResult {
  id: string;
  packageId: string;
  token: string;
  recipientName: string;
  unitNumber: string;
}
