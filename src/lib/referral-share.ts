const DEFAULT_PUBLIC_SITE = "https://protocoloencomendas.com.br";

const REFERRAL_UTM = {
  utm_source: "morador",
  utm_medium: "indicacao",
  utm_campaign: "morador_indica_sindico",
} as const;

function getPublicSiteUrl(): string {
  const raw = (import.meta.env.VITE_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return DEFAULT_PUBLIC_SITE;
  return raw.replace(/\/+$/, "");
}

export function buildReferralLink(extraParams?: Record<string, string>): string {
  const base = getPublicSiteUrl();
  const params = new URLSearchParams({ ...REFERRAL_UTM, ...(extraParams ?? {}) });
  return `${base}/?${params.toString()}`;
}

function firstName(fullName?: string | null): string | null {
  if (!fullName) return null;
  const trimmed = fullName.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0];
}

export function buildReferralWhatsAppText(opts?: { userName?: string | null }): string {
  const name = firstName(opts?.userName);
  const link = buildReferralLink();
  const greeting = name ? `Oi! Aqui é o ${name}.` : "Oi!";
  return [
    greeting,
    "",
    "Encontrei um app que pode resolver de vez aquela bagunça das encomendas no condomínio: o Protocolo Encomendas. A portaria registra em segundos, o morador é avisado na hora e a retirada é com QR — sem fila, sem mensagem em grupo, sem extravio.",
    "",
    "Já me cadastrei como morador e queria muito que a gente testasse aqui. É grátis pra avaliar e a equipe deles dá todo o suporte pra implantar. Posso passar o contato deles ou você dá uma olhada primeiro?",
    "",
    link,
  ].join("\n");
}

function sanitizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

function normalizeBrPhone(raw: string): string {
  const digits = sanitizePhoneDigits(raw);
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  return `55${digits}`;
}

export function buildReferralWhatsAppShareUrl(userName?: string | null): string {
  const text = buildReferralWhatsAppText({ userName });
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildReferralWhatsAppDirectUrl(syndicPhone: string, userName?: string | null): string {
  const phone = normalizeBrPhone(syndicPhone);
  const text = buildReferralWhatsAppText({ userName });
  if (!phone) return `https://wa.me/?text=${encodeURIComponent(text)}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
