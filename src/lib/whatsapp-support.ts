const DEFAULT_PHONE = "5519993148395";

const MESSAGES = {
  landing:
    "Olá! Estou no site do Protocolo Encomendas e gostaria de tirar uma dúvida.",
  login:
    "Olá! Estou na página de login do Protocolo Encomendas e estou com dúvida. Podem me ajudar?",
  register:
    "Olá! Estou na página de cadastro do Protocolo Encomendas e estou com dúvida. Podem me ajudar?",
} as const;

export type WhatsAppSupportContext = keyof typeof MESSAGES;

function normalizePhone(raw: string | undefined): string {
  if (!raw?.trim()) return DEFAULT_PHONE;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : DEFAULT_PHONE;
}

/** DDI + DDD + número, só dígitos (ex.: 5511999999999). */
export function getWhatsAppSupportPhone(): string {
  return normalizePhone(import.meta.env.VITE_WHATSAPP_SUPPORT_PHONE);
}

/** Link wa.me sem mensagem (ex.: botões genéricos de suporte). */
export function whatsAppMeUrl(text?: string): string {
  const phone = getWhatsAppSupportPhone();
  const base = `https://wa.me/${phone}`;
  const t = text?.trim();
  if (!t) return base;
  return `${base}?text=${encodeURIComponent(t)}`;
}

export function buildWhatsAppSupportUrl(context: WhatsAppSupportContext): string {
  return whatsAppMeUrl(MESSAGES[context]);
}
