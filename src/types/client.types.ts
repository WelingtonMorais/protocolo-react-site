/** API pode aninhar o token de retirada como objeto (código em `code`). */
export interface ClientPickupToken {
  id: string;
  packageId: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  usedAt: string | null;
}

export interface ClientPackage {
  id: string;
  status: "WAITING_PICKUP" | "DELIVERED";
  recipientName?: string;
  carrier?: string;
  photoUrl?: string;
  pickupToken?: string | ClientPickupToken;
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

/** Extrai o código exibível do token (string direta ou objeto `{ code }` da API). */
export function normalizePickupTokenCode(
  raw: string | ClientPickupToken | null | undefined
): string | null {
  if (raw == null) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && typeof raw.code === "string") return raw.code;
  return null;
}

/** Resposta de POST /client/packages/:id/pickup-token (formatos variados). */
export function normalizePickupTokenResponse(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string") return data;
  if (typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.token === "string") return o.token;
  if (typeof o.code === "string") return o.code;
  if (o.pickupToken != null) return normalizePickupTokenCode(o.pickupToken as string | ClientPickupToken);
  return null;
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
