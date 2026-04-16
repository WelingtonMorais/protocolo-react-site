import React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Divider,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AddHomeIcon from "@mui/icons-material/AddHome";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HistoryIcon from "@mui/icons-material/History";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { QRScanner } from "@/components/QRScanner";
import { PwaInstallNudge } from "@/components/pwa/PwaInstallNudge";
import type { ClientMembership, ClientPendingAccessRequest } from "@/types/client.types";
import { parseClientPackagesResponse } from "@/types/client.types";

function onlyCpfDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 11);
}

function formatLinkRequestError(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Erro ao enviar pedido. Tente novamente.";
  const d = err.response?.data as {
    message?: string;
    issues?: { fieldErrors?: Record<string, string[] | undefined> };
  };
  if (d?.message === "Validation error" && d.issues?.fieldErrors) {
    const parts = Object.values(d.issues.fieldErrors)
      .flat()
      .filter((x): x is string => typeof x === "string");
    if (parts.length) return parts.join(" ");
  }
  if (typeof d?.message === "string" && d.message !== "Validation error") return d.message;
  return "Erro ao enviar pedido. Tente novamente.";
}

function formatClientUnitLine(unit: { number: string; block: string | null | undefined }): string {
  const b = unit.block?.trim();
  if (!b || b === "-") return `Unidade ${unit.number}`;
  return `Bloco ${b} · Unidade ${unit.number}`;
}

function normalizeCondoInviteCode(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

export const ClientDashboard = (): React.JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [memberships, setMemberships] = useState<ClientMembership[]>([]);
  const [pendingAccess, setPendingAccess] = useState<ClientPendingAccessRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkStep, setLinkStep] = useState(0);
  const [condoCode, setCondoCode] = useState("");
  const [units, setUnits] = useState<{ id: string; number: string; block?: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [cpf, setCpf] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkScannerOpen, setLinkScannerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const handleCondoQrScan = useCallback((decoded: string) => {
    setCondoCode(normalizeCondoInviteCode(decoded));
    setLinkScannerOpen(false);
  }, []);

  const openLinkDialog = (): void => {
    setLinkStep(0);
    setLinkError(null);
    setCondoCode("");
    setUnits([]);
    setSelectedUnit("");
    setCpf("");
    setLinkScannerOpen(false);
    setLinkDialogOpen(true);
  };

  const cpfDigits = onlyCpfDigits(cpf);
  const canSubmitLink = selectedUnit.length > 0 && cpfDigits.length === 11;

  const condoRows = useMemo(() => {
    const memberKeys = new Set(memberships.map((m) => `${m.condominiumId}:${m.unitId}`));
    const pendingOnly = pendingAccess.filter((p) => !memberKeys.has(`${p.condominiumId}:${p.unitId}`));
    return [
      ...pendingOnly.map((data) => ({ kind: "pending" as const, data })),
      ...memberships.map((data) => ({ kind: "membership" as const, data })),
    ];
  }, [memberships, pendingAccess]);

  const refetch = async (opts?: { quiet?: boolean }): Promise<void> => {
    try {
      if (!opts?.quiet) {
        setLoading(true);
      }
      setError(null);
      const pendingPromise = api
        .get<ClientPendingAccessRequest[]>("/client/access-requests/pending")
        .then((r) => r.data)
        .catch(() => [] as ClientPendingAccessRequest[]);

      const [membRes, pkgRes, pendingList] = await Promise.all([
        api.get<ClientMembership[]>("/client/memberships"),
        api.get<unknown>("/client/packages"),
        pendingPromise,
      ]);
      setMemberships(membRes.data);
      setPendingAccess(Array.isArray(pendingList) ? pendingList : []);
      const list = parseClientPackagesResponse(pkgRes.data);
      setPendingCount(list.filter((p) => p.status === "WAITING_PICKUP").length);
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      if (!opts?.quiet) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  const handleResolveCode = async (): Promise<void> => {
    setLinkError(null);
    setLinkLoading(true);
    try {
      const res = await api.post<{ id: string; units: { id: string; number: string; block?: string }[] }>(
        "/client/condominiums/resolve-code",
        { code: condoCode }
      );
      setUnits(res.data.units ?? []);
      setSelectedUnit("");
      setLinkStep(1);
    } catch {
      setLinkError("Código não encontrado. Verifique e tente novamente.");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleLinkRequest = async (): Promise<void> => {
    setLinkError(null);
    const digits = onlyCpfDigits(cpf);
    if (!selectedUnit || digits.length !== 11) {
      setLinkError("Selecione a unidade e informe o CPF com 11 dígitos.");
      return;
    }
    setLinkLoading(true);
    try {
      await api.post("/client/access-requests", {
        joinCode: condoCode.trim(),
        unitId: selectedUnit,
        cpf: digits,
      });
      setLinkDialogOpen(false);
      setLinkStep(0);
      setLinkError(null);
      setCondoCode("");
      setSelectedUnit("");
      setCpf("");
      setUnits([]);
      await refetch({ quiet: true });
      setSnackbar({
        open: true,
        message:
          'Pedido enviado com sucesso! Aguarde a aprovação da portaria. Acompanhe o status na seção "Meus Condomínios" abaixo.',
      });
    } catch (err) {
      setLinkError(formatLinkRequestError(err));
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Olá, {user?.name?.split(" ")[0]}!</Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhe suas encomendas aqui.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PwaInstallNudge />

      <StaggerContainer>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <StaggerItem>
          <Card
            sx={{ cursor: "pointer", transition: "all 0.2s", "&:hover": { boxShadow: "0 8px 30px rgba(96,52,225,0.15)", transform: "translateY(-2px)" } }}
            onClick={() => navigate("/morador/pacotes")}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ bgcolor: "warning.main", borderRadius: 2, p: 1.5, color: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <Inventory2Icon />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.03em" }}>{loading ? "—" : pendingCount}</Typography>
                <Typography variant="body2" color="text.secondary">Aguardando Retirada</Typography>
              </Box>
            </CardContent>
          </Card>
          </StaggerItem>
        </Grid>
        <Grid item xs={12} sm={6}>
          <StaggerItem>
          <Card
            sx={{ cursor: "pointer", transition: "all 0.2s", "&:hover": { boxShadow: "0 8px 30px rgba(96,52,225,0.15)", transform: "translateY(-2px)" } }}
            onClick={() => navigate("/morador/historico")}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ bgcolor: "primary.main", borderRadius: 2, p: 1.5, color: "white", boxShadow: "0 4px 12px rgba(96,52,225,0.3)" }}>
                <HistoryIcon />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>Histórico</Typography>
                <Typography variant="body2" color="text.secondary">Ver todos os pacotes</Typography>
              </Box>
            </CardContent>
          </Card>
          </StaggerItem>
        </Grid>
      </Grid>
      </StaggerContainer>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Meus Condomínios</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddHomeIcon />}
              onClick={openLinkDialog}
            >
              Vincular
            </Button>
          </Box>

          {loading ? (
            <CircularProgress size={24} />
          ) : condoRows.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <ApartmentIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary" mb={2}>
                Você não está vinculado a nenhum condomínio.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddHomeIcon />}
                onClick={openLinkDialog}
              >
                Vincular ao meu condomínio
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {condoRows.map((row) => {
                const m = row.data;
                const isPending = row.kind === "pending";
                return (
                  <Box
                    key={isPending ? `pending-${m.id}` : `mem-${m.id}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <ApartmentIcon color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>{m.condominium.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatClientUnitLine(m.unit)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={isPending ? "Pendente" : "Aprovado"}
                      color={isPending ? "warning" : "success"}
                      size="small"
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Link condo dialog */}
      <Dialog
        open={linkDialogOpen}
        onClose={() => {
          setLinkDialogOpen(false);
          setLinkStep(0);
          setLinkError(null);
          setLinkScannerOpen(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Vincular Condomínio</DialogTitle>
        <DialogContent>
          <Stepper activeStep={linkStep} alternativeLabel sx={{ mb: 3, mt: 1 }}>
            {["Código", "Unidade", "Enviar"].map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {linkError && <Alert severity="error" sx={{ mb: 2 }}>{linkError}</Alert>}

          {linkStep === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Código do condomínio"
                fullWidth
                value={condoCode}
                onChange={(e) => setCondoCode(normalizeCondoInviteCode(e.target.value))}
                placeholder="Ex: ABC123"
                autoFocus
                helperText="Digite o código ou escaneie o QR de convite do condomínio."
              />
              <Divider>
                <Typography variant="caption" color="text.secondary">ou</Typography>
              </Divider>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<QrCodeScannerIcon />}
                onClick={() => setLinkScannerOpen(true)}
              >
                Escanear QR Code
              </Button>
            </Box>
          )}

          {linkStep === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {units.length === 0 ? (
                <Alert severity="warning">
                  Este condomínio ainda não possui unidades cadastradas. Peça ao síndico ou portaria para cadastrar
                  unidades antes de vincular.
                </Alert>
              ) : (
                <TextField
                  label="Sua unidade"
                  select
                  required
                  fullWidth
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <MenuItem value="" disabled>
                    Selecione a unidade
                  </MenuItem>
                  {units.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.block && u.block !== "-"
                        ? `Bloco ${u.block} · Unidade ${u.number}`
                        : `Unidade ${u.number}`}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                label="CPF"
                required
                fullWidth
                value={cpf}
                onChange={(e) => setCpf(onlyCpfDigits(e.target.value))}
                placeholder="00000000000"
                helperText="Obrigatório — 11 dígitos (apenas números)."
                inputProps={{
                  maxLength: 14,
                  inputMode: "numeric",
                  "aria-label": "CPF",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLinkDialogOpen(false);
              setLinkStep(0);
              setLinkError(null);
              setLinkScannerOpen(false);
            }}
          >
            Cancelar
          </Button>
          {linkStep === 0 && (
            <Button
              variant="contained"
              onClick={() => void handleResolveCode()}
              disabled={linkLoading || !condoCode}
            >
              {linkLoading ? "Buscando..." : "Continuar"}
            </Button>
          )}
          {linkStep === 1 && (
            <Button
              variant="contained"
              onClick={() => void handleLinkRequest()}
              disabled={linkLoading || units.length === 0 || !canSubmitLink}
            >
              {linkLoading ? "Enviando..." : "Enviar Pedido"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <QRScanner
        open={linkScannerOpen}
        onClose={() => setLinkScannerOpen(false)}
        onScan={handleCondoQrScan}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={8000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSnackbar((s) => ({ ...s, open: false }));
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%", alignItems: "center" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
