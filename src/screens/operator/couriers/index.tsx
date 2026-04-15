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
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import { couriersService } from "./services/couriers.service";
import type { Courier } from "@/types/operator.types";

function maskCourierTokenDisplay(token: string): string {
  const t = token.trim();
  if (t.length === 4) return `${t[0]}**${t[3]}`;
  if (t.length <= 1) return "****";
  return `${t[0]}${"*".repeat(Math.max(0, t.length - 2))}${t[t.length - 1]}`;
}

export const CouriersScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const refetch = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await couriersService.getAll();
      setCouriers(data);
    } catch {
      setError("Erro ao carregar mensageiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Deseja excluir este mensageiro?")) return;
    setDeleting(id);
    try {
      await couriersService.delete(id);
      setCouriers((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Erro ao excluir mensageiro.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Mensageiros</Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os mensageiros autorizados do condomínio.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/operador/mensageiros/create")}
        >
          Novo Mensageiro
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : couriers.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary" mb={2}>
                Nenhum mensageiro cadastrado.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate("/operador/mensageiros/create")}
              >
                Cadastrar primeiro mensageiro
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Token (PIN)</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {couriers.map((courier) => (
                    <TableRow key={courier.id} hover>
                      <TableCell>{courier.name}</TableCell>
                      <TableCell sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {courier.email}
                      </TableCell>
                      <TableCell>
                        <Chip label={maskCourierTokenDisplay(courier.token)} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/operador/mensageiros/edit?id=${courier.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => void handleDelete(courier.id)}
                            disabled={deleting === courier.id}
                          >
                            {deleting === courier.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
