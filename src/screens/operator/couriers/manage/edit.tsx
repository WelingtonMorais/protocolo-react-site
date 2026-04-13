import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useSearchParams } from "react-router-dom";

import { couriersService } from "../services/couriers.service";

export const EditCourierScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const all = await couriersService.getAll();
        const courier = all.find((c) => c.id === id);
        if (courier) {
          setName(courier.name);
          setToken(courier.token);
        }
      } catch {
        setError("Erro ao carregar mensageiro.");
      } finally {
        setLoadingData(false);
      }
    };
    if (id) void load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await couriersService.update(id, { name, token });
      navigate("/operador/mensageiros");
    } catch {
      setError("Erro ao atualizar mensageiro.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: "auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/operador/mensageiros")}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Typography variant="h5" mb={0.5}>Editar Mensageiro</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Atualize os dados do mensageiro.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Nome do mensageiro"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Token / PIN (4 dígitos)"
              fullWidth
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 4 }}
              placeholder="0000"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !name || token.length < 4}
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
