import React from "react";
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

import { authService } from "@/services/auth.service";

type Step = "cpf" | "validate" | "reset" | "done";

export const ForgotPasswordScreen = (): React.JSX.Element => {
  const [step, setStep] = useState<Step>("cpf");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckCpf = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authService.checkCpf(cpf);
      if (result.exists) {
        setStep("validate");
      } else {
        setError("CPF não encontrado. Verifique e tente novamente.");
      }
    } catch {
      setError("Erro ao verificar CPF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authService.validatePasswordRecovery({ cpf, email });
      setToken(result.token);
      setStep("reset");
    } catch {
      setError("Dados inválidos. Verifique e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword({ token, password: newPassword });
      setStep("done");
    } catch {
      setError("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F7F5FF",
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(96,52,225,0.08)",
            border: "1px solid rgba(96,52,225,0.08)",
          }}
        >
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 3,
              width: "fit-content",
              color: "text.secondary",
              fontSize: "0.85rem",
              "&:hover": { color: "primary.main" },
              transition: "color 0.2s",
            }}
          >
            <ArrowBackIcon fontSize="small" />
            <Typography variant="body2">Voltar ao login</Typography>
          </Link>

          <Typography variant="h5" fontWeight={800} mb={0.5} sx={{ letterSpacing: "-0.03em" }}>
            Recuperar Senha
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {step === "cpf" && "Informe seu CPF cadastrado"}
            {step === "validate" && "Confirme seu e-mail"}
            {step === "reset" && "Crie sua nova senha"}
            {step === "done" && "Senha alterada com sucesso!"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {step === "cpf" && (
            <Box component="form" onSubmit={handleCheckCpf} noValidate>
              <TextField
                label="CPF"
                fullWidth
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                sx={{ mb: 3 }}
                size="medium"
                placeholder="000.000.000-00"
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ height: 52 }}>
                {loading ? "Verificando..." : "Continuar"}
              </Button>
            </Box>
          )}

          {step === "validate" && (
            <Box component="form" onSubmit={handleValidate} noValidate>
              <TextField
                label="E-mail cadastrado"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
                size="medium"
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ height: 52 }}>
                {loading ? "Validando..." : "Validar"}
              </Button>
            </Box>
          )}

          {step === "reset" && (
            <Box component="form" onSubmit={handleReset} noValidate>
              <TextField
                label="Nova senha"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 3 }}
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ height: 52 }}>
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </Box>
          )}

          {step === "done" && (
            <Box textAlign="center">
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Sua senha foi redefinida com sucesso!
              </Alert>
              <Button variant="contained" component={RouterLink} to="/login" fullWidth size="large" sx={{ height: 52 }}>
                Ir para o login
              </Button>
            </Box>
          )}
        </Box>
      </motion.div>
    </Box>
  );
};
