import React from "react";
import { useState, useEffect } from "react";
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

import { api } from "@/services/api";
import type { Unit } from "@/types/operator.types";

export const UnitsScreen = (): React.JSX.Element => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [condominiumId, setCondominiumId] = useState<string | null>(null);

  const [newNumber, setNewNumber] = useState("");
  const [newBlock, setNewBlock] = useState("");
  const [creating, setCreating] = useState(false);

  const refetch = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const condoRes = await api.get<{ id: string }>("/employee/condominiums");
      const cid = (condoRes.data as { id?: string }).id;
      if (cid) {
        setCondominiumId(cid);
        const unitsRes = await api.get<Unit[]>(`/employee/condominiums/${cid}/units`);
        setUnits(unitsRes.data);
      }
    } catch {
      setError("Erro ao carregar unidades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  const handleCreate = async (): Promise<void> => {
    if (!condominiumId || !newNumber) return;
    setCreating(true);
    try {
      await api.post("/employee/units", {
        condominiumId,
        number: newNumber,
        block: newBlock || undefined,
      });
      setDialogOpen(false);
      setNewNumber("");
      setNewBlock("");
      await refetch();
    } catch {
      setError("Erro ao criar unidade.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Unidades</Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as unidades do condomínio.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Atualizar">
            <IconButton onClick={() => void refetch()} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Nova Unidade
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : units.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary" mb={2}>Nenhuma unidade cadastrada.</Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                Cadastrar primeira unidade
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bloco</TableCell>
                    <TableCell>Número / Apartamento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id} hover>
                      <TableCell>{unit.block ?? "—"}</TableCell>
                      <TableCell>{unit.number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nova Unidade</DialogTitle>
        <DialogContent>
          <TextField
            label="Número / Apartamento"
            fullWidth
            required
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            placeholder="Ex: 101"
          />
          <TextField
            label="Bloco (opcional)"
            fullWidth
            value={newBlock}
            onChange={(e) => setNewBlock(e.target.value)}
            placeholder="Ex: A"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => void handleCreate()}
            disabled={creating || !newNumber}
          >
            {creating ? "Criando..." : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
