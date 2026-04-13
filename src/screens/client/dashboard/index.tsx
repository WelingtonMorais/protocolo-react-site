import React from "react";
import { useState, useEffect } from "react";
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
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AddHomeIcon from "@mui/icons-material/AddHome";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";

import { api } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import type { Membership } from "@/types/client.types";

export const ClientDashboard = (): React.JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [memberships, setMemberships] = useState<Membership[]>([]);
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
  const [condoId, setCondoId] = useState("");

  const refetch = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const [membRes, pkgRes] = await Promise.all([
        api.get<Membership[]>("/client/memberships"),
        api.get<
          | { packages: { status: string }[] }
          | { status: string }[]
        >("/client/packages"),
      ]);
      setMemberships(membRes.data);
      const raw = pkgRes.data;
      const list = Array.isArray(raw) ? raw : (raw.packages ?? []);
      setPendingCount(list.filter((p) => p.status === "WAITING_PICKUP").length);
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
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
      setCondoId(res.data.id);
      setUnits(res.data.units ?? []);
      setLinkStep(1);
    } catch {
      setLinkError("Código não encontrado. Verifique e tente novamente.");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleLinkRequest = async (): Promise<void> => {
    setLinkError(null);
    setLinkLoading(true);
    try {
      await api.post("/client/access-requests", {
        condominiumId: condoId,
        unitId: selectedUnit || undefined,
        cpf: cpf || undefined,
      });
      setLinkDialogOpen(false);
      setLinkStep(0);
      setCondoCode("");
      setSelectedUnit("");
      setCpf("");
      await refetch();
    } catch {
      setLinkError("Erro ao enviar pedido. Tente novamente.");
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
              onClick={() => setLinkDialogOpen(true)}
            >
              Vincular
            </Button>
          </Box>

          {loading ? (
            <CircularProgress size={24} />
          ) : memberships.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <ApartmentIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary" mb={2}>
                Você não está vinculado a nenhum condomínio.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddHomeIcon />}
                onClick={() => setLinkDialogOpen(true)}
              >
                Vincular ao meu condomínio
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {memberships.map((m) => (
                <Box
                  key={m.id}
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
                      <Typography variant="body1" fontWeight={500}>{m.condominiumName}</Typography>
                      {m.unit && (
                        <Typography variant="body2" color="text.secondary">
                          {m.unit.block ? `Bloco ${m.unit.block} - ` : ""}Ap. {m.unit.number}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Chip
                    label={m.status === "APPROVED" ? "Aprovado" : m.status === "PENDING" ? "Pendente" : "Rejeitado"}
                    color={m.status === "APPROVED" ? "success" : m.status === "PENDING" ? "warning" : "error"}
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Link condo dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Vincular Condomínio</DialogTitle>
        <DialogContent>
          <Stepper activeStep={linkStep} alternativeLabel sx={{ mb: 3, mt: 1 }}>
            {["Código", "Unidade", "Enviar"].map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {linkError && <Alert severity="error" sx={{ mb: 2 }}>{linkError}</Alert>}

          {linkStep === 0 && (
            <TextField
              label="Código do condomínio"
              fullWidth
              value={condoCode}
              onChange={(e) => setCondoCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              autoFocus
            />
          )}

          {linkStep === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Selecione sua unidade"
                select
                fullWidth
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
              >
                <MenuItem value="">— Não tenho unidade ainda —</MenuItem>
                {units.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.block ? `Bloco ${u.block} - ` : ""}Ap. {u.number}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="CPF (opcional)"
                fullWidth
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancelar</Button>
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
              disabled={linkLoading}
            >
              {linkLoading ? "Enviando..." : "Enviar Pedido"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
