export interface ClientPackage {
  id: string;
  status: "WAITING_PICKUP" | "DELIVERED";
  recipientName?: string;
  carrier?: string;
  photoUrl?: string;
  pickupToken?: string;
  createdAt: string;
  deliveredAt?: string;
  unit?: { id: string; number: string; block?: string };
  condominium?: { id: string; name: string };
}

/** GET /client/packages pode retornar array ou `{ packages, total, hasMore }`. */
export function parseClientPackagesResponse(data: unknown): ClientPackage[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "packages" in data) {
    const p = (data as { packages?: unknown }).packages;
    return Array.isArray(p) ? (p as ClientPackage[]) : [];
  }
  return [];
}

/** GET /client/memberships — vínculo ativo (sem campo status no banco). */
export interface ClientMembership {
  id: string;
  userId: string;
  condominiumId: string;
  unitId: string;
  createdAt: string;
  updatedAt: string;
  condominium: { id: string; name: string };
  unit: { id: string; number: string; block: string | null };
}

/** GET /client/access-requests/pending */
export interface ClientPendingAccessRequest {
  id: string;
  userId: string;
  condominiumId: string;
  unitId: string;
  cpf: string;
  status: "PENDING";
  createdAt: string;
  updatedAt: string;
  condominium: { id: string; name: string };
  unit: { id: string; number: string; block: string | null };
}
