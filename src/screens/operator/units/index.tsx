import React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import type { Unit } from "@/types/operator.types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;
  const d = err.response?.data as { message?: string; issues?: { fieldErrors?: Record<string, string[] | undefined> } };
  if (d?.message === "Validation error" && d.issues?.fieldErrors) {
    const parts = Object.values(d.issues.fieldErrors)
      .flat()
      .filter((x): x is string => typeof x === "string");
    if (parts.length) return parts.join(" ");
  }
  if (typeof d?.message === "string" && d.message !== "Validation error") return d.message;
  return fallback;
}

/** Bloco no formulário → campo `block` na API (1 letra A–Z). */
function sanitizeBlockLetter(raw: string): string {
  const c = raw.replace(/[^a-zA-Z]/g, "").slice(0, 1);
  return c.toUpperCase();
}

/** Unidade no formulário → campo `number` na API (até 5 dígitos). */
function sanitizeUnitDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 5);
}

function sortUnitsForDisplay(list: Unit[]): Unit[] {
  return [...list].sort((a, b) => {
    const la = (a.block ?? "").toUpperCase();
    const lb = (b.block ?? "").toUpperCase();
    if (la !== lb) return la.localeCompare(lb, "pt", { sensitivity: "base" });
    const na = parseInt(a.number, 10);
    const nb = parseInt(b.number, 10);
    if (!Number.isNaN(na) && !Number.isNaN(nb) && String(na) === a.number.trim() && String(nb) === b.number.trim()) {
      return na - nb;
    }
    return a.number.localeCompare(b.number, "pt", { numeric: true });
  });
}

function formatBlockLetter(block: string | undefined): string {
  if (!block || block === "-") return "—";
  return block.toUpperCase();
}

export const UnitsScreen = (): React.JSX.Element => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noCondo, setNoCondo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [condominiumId, setCondominiumId] = useState<string | null>(null);

  /** 1 letra (Bloco → API block) */
  const [blockLetter, setBlockLetter] = useState("");
  /** até 5 dígitos (Unidade → API number) */
  const [unitDigits, setUnitDigits] = useState("");
  const [creating, setCreating] = useState(false);

  const sortedUnits = useMemo(() => sortUnitsForDisplay(units), [units]);

  const refetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setNoCondo(false);

      let cid = user?.condominiumId ?? null;
      if (!cid) {
        const meRes = await api.get<{ id: string } | null>("/employee/condominiums/me");
        cid = meRes.data?.id ?? null;
      }

      if (!cid) {
        setNoCondo(true);
        setCondominiumId(null);
        setUnits([]);
        return;
      }

      setCondominiumId(cid);
      const unitsRes = await api.get<Unit[]>(`/employee/condominiums/${cid}/units`);
      setUnits(unitsRes.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao carregar unidades."));
    } finally {
      setLoading(false);
    }
  }, [user?.condominiumId]);

  useEffect(() => {
    if (authLoading) return;
    void refetch();
  }, [authLoading, refetch]);

  const canCreate =
    blockLetter.length === 1 &&
    /^[A-Z]$/.test(blockLetter) &&
    unitDigits.length >= 1 &&
    unitDigits.length <= 5 &&
    /^\d+$/.test(unitDigits);

  const handleCreate = async (): Promise<void> => {
    if (!condominiumId || !canCreate) return;
    setCreating(true);
    try {
      await api.post("/employee/units", {
        condominiumId,
        block: blockLetter,
        number: unitDigits,
      });
      setDialogOpen(false);
      setBlockLetter("");
      setUnitDigits("");
      await refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao criar unidade."));
    } finally {
      setCreating(false);
    }
  };

  const resetDialog = (): void => {
    setBlockLetter("");
    setUnitDigits("");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Unidades</Typography>
          <Typography variant="body2" color="text.secondary">
            Bloco = letra (A-Z). Unidade = número do apartamento/sala (até 5 dígitos).
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Atualizar">
            <IconButton onClick={() => void refetch()} disabled={loading || noCondo}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetDialog();
              setDialogOpen(true);
            }}
            disabled={noCondo || !condominiumId}
          >
            Nova Unidade
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {noCondo && !error && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/operador/condominio")}>
              Meu condomínio
            </Button>
          }
        >
          Crie seu condomínio para cadastrar e listar unidades.
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : noCondo ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Nenhum condomínio associado à sua conta ainda.
            </Typography>
          ) : units.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary" mb={2}>Nenhuma unidade cadastrada.</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetDialog();
                  setDialogOpen(true);
                }}
              >
                Cadastrar primeira unidade
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bloco</TableCell>
                    <TableCell>Unidade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUnits.map((unit) => (
                    <TableRow key={unit.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{formatBlockLetter(unit.block)}</TableCell>
                      <TableCell>{unit.number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetDialog();
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Nova Unidade</DialogTitle>
        <DialogContent>
          <TextField
            label="Bloco"
            fullWidth
            required
            value={blockLetter}
            onChange={(e) => setBlockLetter(sanitizeBlockLetter(e.target.value))}
            sx={{ mb: 2, mt: 1 }}
            placeholder="A"
            helperText="Uma letra (A–Z), maiúscula."
            inputProps={{
              maxLength: 1,
              inputMode: "text",
              "aria-label": "Letra do bloco",
            }}
          />
          <TextField
            label="Unidade"
            fullWidth
            required
            value={unitDigits}
            onChange={(e) => setUnitDigits(sanitizeUnitDigits(e.target.value))}
            placeholder="Ex: 101"
            helperText="Somente números, até 5 caracteres, sem espaços."
            inputProps={{
              maxLength: 5,
              inputMode: "numeric",
              pattern: "\\d*",
              "aria-label": "Número da unidade",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              resetDialog();
            }}
          >
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => void handleCreate()} disabled={creating || !canCreate}>
            {creating ? "Criando..." : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
