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
import axios from "axios";

import { couriersService } from "../services/couriers.service";

function formatUpdateCourierError(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Erro ao atualizar mensageiro.";
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
  if (typeof d?.message === "string" && d.message !== "Validation error") {
    return d.message;
  }
  return "Erro ao atualizar mensageiro.";
}

export const EditCourierScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
          setEmail(courier.email);
          setPhone(courier.phone);
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

  const phoneDigits = phone.replace(/\D/g, "");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await couriersService.update(id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneDigits,
      });
      navigate("/operador/mensageiros");
    } catch (err) {
      setError(formatUpdateCourierError(err));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    name.trim().length >= 2 &&
    email.includes("@") &&
    phoneDigits.length >= 10;

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
        Atualize nome, e-mail e telefone. O PIN não pode ser alterado por aqui.
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
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Telefone"
              type="tel"
              fullWidth
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="11999999999"
            />
            <TextField
              label="Token / PIN (somente leitura)"
              fullWidth
              value={token}
              sx={{ mb: 3 }}
              InputProps={{ readOnly: true }}
              helperText="Para trocar o PIN, exclua e cadastre novamente ou use o app operador, se disponível."
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !canSubmit}
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
