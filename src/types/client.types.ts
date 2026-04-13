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

export interface Membership {
  id: string;
  condominiumId: string;
  condominiumName: string;
  unit?: { id: string; number: string; block?: string };
  status: "PENDING" | "APPROVED" | "REJECTED";
}
