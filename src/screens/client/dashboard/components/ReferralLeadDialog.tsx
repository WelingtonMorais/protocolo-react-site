import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import axios from "axios";

import { api } from "@/services/api";
import { trackEvent } from "@/lib/analytics";
import { buildReferralWhatsAppDirectUrl } from "@/lib/referral-share";

interface ReferralLeadDialogProps {
  open: boolean;
  onClose: () => void;
  userName?: string | null;
  source: "modal" | "hero";
  onSuccess?: () => void;
}

interface FormState {
  condominiumName: string;
  syndicName: string;
  syndicPhone: string;
  city: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  condominiumName: "",
  syndicName: "",
  syndicPhone: "",
  city: "",
  message: "",
};

function maskBrPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatSubmitError(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Não foi possível enviar agora. Tente novamente.";
  const data = err.response?.data as
    | { message?: string; issues?: { fieldErrors?: Record<string, string[] | undefined> } }
    | undefined;
  if (data?.message === "Validation error" && data.issues?.fieldErrors) {
    const parts = Object.values(data.issues.fieldErrors)
      .flat()
      .filter((x): x is string => typeof x === "string");
    if (parts.length) return parts.join(" ");
  }
  if (typeof data?.message === "string" && data.message !== "Validation error")
    return data.message;
  return "Não foi possível enviar agora. Tente novamente.";
}

export const ReferralLeadDialog = ({
  open,
  onClose,
  userName,
  source,
  onSuccess,
}: ReferralLeadDialogProps): React.JSX.Element => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);

  const phoneDigits = onlyDigits(form.syndicPhone);
  const canSubmit =
    form.condominiumName.trim().length >= 2 &&
    form.syndicName.trim().length >= 2 &&
    phoneDigits.length >= 10 &&
    phoneDigits.length <= 11;

  const resetAndClose = (): void => {
    setForm(INITIAL_FORM);
    setError(null);
    setSubmittedPhone(null);
    setLoading(false);
    onClose();
  };

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const raw = e.target.value;
      const next = field === "syndicPhone" ? maskBrPhone(raw) : raw;
      setForm((prev) => ({ ...prev, [field]: next }));
    };

  const handleSubmit = async (): Promise<void> => {
    setError(null);
    if (!canSubmit) {
      setError("Preencha condomínio, nome do síndico e WhatsApp (com DDD).");
      return;
    }
    setLoading(true);
    trackEvent("referral_lead_submit", { source });
    try {
      await api.post("/client/referrals", {
        condominiumName: form.condominiumName.trim(),
        syndicName: form.syndicName.trim(),
        syndicPhone: phoneDigits,
        city: form.city.trim() || undefined,
        message: form.message.trim() || undefined,
      });
      trackEvent("referral_lead_success", { source });
      setSubmittedPhone(phoneDigits);
      onSuccess?.();
    } catch (err) {
      setError(formatSubmitError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = (): void => {
    if (!submittedPhone) return;
    trackEvent("referral_whatsapp_share", { source, action: "post_lead_direct" });
    const url = buildReferralWhatsAppDirectUrl(submittedPhone, userName ?? null);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : resetAndClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pr: 6 }}>
        {submittedPhone ? "Indicação recebida!" : "Falar com meu síndico"}
        <IconButton
          aria-label="fechar"
          onClick={resetAndClose}
          disabled={loading}
          sx={{ position: "absolute", right: 8, top: 8, color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {submittedPhone ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h6" textAlign="center">
              Recebemos! Nosso time vai falar com seu síndico nas próximas horas.
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Enquanto isso, se quiser adiantar a conversa, abra um WhatsApp pré-pronto agora mesmo:
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Conta pra gente quem é o síndico e em qual condomínio. A nossa equipe entra em
              contato com ele explicando como o app pode ajudar — sem custo pra testar.
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Nome do condomínio"
              required
              fullWidth
              value={form.condominiumName}
              onChange={handleChange("condominiumName")}
              inputProps={{ maxLength: 120 }}
              autoFocus
            />
            <TextField
              label="Nome do síndico ou responsável"
              required
              fullWidth
              value={form.syndicName}
              onChange={handleChange("syndicName")}
              inputProps={{ maxLength: 120 }}
            />
            <TextField
              label="WhatsApp do síndico (com DDD)"
              required
              fullWidth
              value={form.syndicPhone}
              onChange={handleChange("syndicPhone")}
              placeholder="(11) 99999-9999"
              inputProps={{ inputMode: "numeric", maxLength: 16 }}
              helperText="Usaremos só para um primeiro contato profissional."
            />
            <TextField
              label="Cidade (opcional)"
              fullWidth
              value={form.city}
              onChange={handleChange("city")}
              inputProps={{ maxLength: 80 }}
            />
            <TextField
              label="Mensagem (opcional)"
              fullWidth
              multiline
              minRows={2}
              value={form.message}
              onChange={handleChange("message")}
              inputProps={{ maxLength: 500 }}
              placeholder="Algo que você queira que a gente diga ao síndico?"
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {submittedPhone ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
            <Button onClick={resetAndClose} color="inherit" sx={{ flex: 1 }}>
              Fechar
            </Button>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={handleSendNow}
              sx={{
                flex: 2,
                background: "linear-gradient(135deg,#25D366,#128C7E)",
                "&:hover": { background: "linear-gradient(135deg,#1fbe5b,#0f6f63)" },
              }}
            >
              Avisar síndico no WhatsApp
            </Button>
          </Stack>
        ) : (
          <>
            <Button onClick={resetAndClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={() => void handleSubmit()}
              disabled={loading || !canSubmit}
            >
              {loading ? "Enviando..." : "Enviar indicação"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
