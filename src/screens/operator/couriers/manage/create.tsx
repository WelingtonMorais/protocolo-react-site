import React from "react";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import { couriersService } from "../services/couriers.service";

export const CreateCourierScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await couriersService.create({ name, token });
      navigate("/operador/mensageiros");
    } catch {
      setError("Erro ao criar mensageiro. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: "auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/operador/mensageiros")}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Typography variant="h5" mb={0.5}>Novo Mensageiro</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Cadastre um mensageiro autorizado.
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
              inputProps={{ maxLength: 4, pattern: "\\d{4}" }}
              placeholder="0000"
              helperText="PIN de 4 dígitos usado para identificar o mensageiro"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !name || token.length < 4}
            >
              {loading ? "Salvando..." : "Cadastrar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
