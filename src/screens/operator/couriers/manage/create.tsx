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
import axios from "axios";

import { couriersService } from "../services/couriers.service";

function formatCreateCourierError(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Erro ao criar mensageiro. Verifique os dados.";
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
  return "Erro ao criar mensageiro. Verifique os dados.";
}

export const CreateCourierScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneDigits = phone.replace(/\D/g, "");
  const tokenDigits = token.replace(/\D/g, "").slice(0, 4);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await couriersService.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneDigits,
        token: tokenDigits.length === 4 ? tokenDigits : undefined,
      });
      navigate("/operador/mensageiros");
    } catch (err) {
      setError(formatCreateCourierError(err));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    name.trim().length >= 2 &&
    email.includes("@") &&
    phoneDigits.length >= 10 &&
    tokenDigits.length === 4;

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
        Cadastre um mensageiro autorizado. E-mail e telefone são exigidos pela API (único por mensageiro).
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
              autoComplete="off"
              helperText="Usado como identificador único do mensageiro"
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
              helperText="Mínimo 10 dígitos (apenas números são enviados)"
            />
            <TextField
              label="Token / PIN (4 dígitos)"
              fullWidth
              required
              value={tokenDigits}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 4))}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 4, inputMode: "numeric", pattern: "\\d{4}" }}
              placeholder="0000"
              helperText="PIN de 4 dígitos para identificar o mensageiro no app"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !canSubmit}
            >
              {loading ? "Salvando..." : "Cadastrar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
