import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { WhatsAppIcon } from "@/components/support/WhatsAppIcon";
import { buildWhatsAppSupportUrl } from "@/lib/whatsapp-support";
import logoApp from "../../../assets/logo_app.png";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

export const LoginScreen = (): React.JSX.Element => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const dest = user.role === "CLIENT" ? "/morador/dashboard" : "/operador/dashboard";
    navigate(dest, { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch {
      setError("E-mail ou senha incorretos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const words = ["Segurança", "e", "tecnologia", "para", "seu", "condomínio."];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* ── LEFT PANEL (dark, artistic) ── */}
      {!isMobile && (
        <Box
          className="auth-side-left"
          sx={{
            width: { md: "48%", lg: "52%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            p: 6,
            bgcolor: "#0D0A1A",
          }}
        >
          <AnimatedBackground />

          <Box sx={{ position: "relative", zIndex: 1, maxWidth: 420, width: "100%" }}>
            {/* Logo with spring animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] }}
              style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Spinning orbit around logo */}
                <Box
                  sx={{
                    position: "absolute",
                    width: 130,
                    height: 130,
                    borderRadius: "50%",
                    border: "1px dashed rgba(96,52,225,0.4)",
                    animation: "spinOrbit 12s linear infinite",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    border: "1px solid rgba(139,92,246,0.2)",
                    animation: "spinOrbitReverse 18s linear infinite",
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 1,
                    px: 1.25,
                    borderRadius: "9999px",
                    overflow: "hidden",
                    bgcolor: "rgba(255,255,255,0.06)",
                    boxShadow:
                      "0 6px 24px rgba(0,0,0,0.45), 0 2px 12px rgba(96,52,225,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <Box
                    component="img"
                    src={logoApp}
                    alt="Protocolo Encomendas"
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: "contain",
                      display: "block",
                      borderRadius: "14px",
                      filter: "drop-shadow(0 0 16px rgba(96,52,225,0.45))",
                    }}
                  />
                </Box>
              </Box>
            </motion.div>

            {/* Word-by-word title reveal (Montfort Title animation) */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h2"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: { md: "2rem", lg: "2.5rem" },
                  lineHeight: 1.25,
                  letterSpacing: "-0.03em",
                }}
              >
                {words.map((word, i) => (
                  <span
                    key={i}
                    className="split-title-word"
                  >
                    <motion.span
                      className="split-title-inner"
                      style={{ display: "inline-block" }}
                      initial={{ opacity: 0, y: "100%" }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.65,
                        delay: 0.5 + i * 0.08,
                        ease: EASE,
                      }}
                    >
                      {word}
                    </motion.span>
                    {" "}
                  </span>
                ))}
              </Typography>
            </Box>

            <motion.div {...fadeUp(1.2)}>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                  maxWidth: 340,
                }}
              >
                Gerencie entregas, moradores e acessos do seu condomínio em um só lugar.
              </Typography>
            </motion.div>

            {/* Animated line */}
            <motion.div
              initial={{ scaleX: 0, transformOrigin: "left center" }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 1.5, ease: EASE }}
              style={{
                height: 1,
                background: "linear-gradient(90deg, rgba(96,52,225,0.8) 0%, transparent 100%)",
                marginTop: 32,
                width: "100%",
                transformOrigin: "left center",
              }}
            />

            {/* Feature pills */}
            <motion.div {...fadeUp(1.7)}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 3 }}>
                {["Encomendas", "QR Code", "Tempo real", "Moradores"].map((tag) => (
                  <Box
                    key={tag}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "20px",
                      border: "1px solid rgba(96,52,225,0.35)",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      backdropFilter: "blur(4px)",
                      bgcolor: "rgba(96,52,225,0.08)",
                    }}
                  >
                    {tag}
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Box>
      )}

      {/* ── RIGHT PANEL (light, form) ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F7F5FF",
          p: { xs: 3, md: 6 },
          position: "relative",
        }}
      >
        {/* Mobile logo */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] }}
            style={{ marginBottom: 16 }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                py: 0.75,
                px: 1,
                borderRadius: "9999px",
                overflow: "hidden",
                bgcolor: "rgba(96,52,225,0.08)",
                boxShadow:
                  "0 6px 20px rgba(96,52,225,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              <Box
                component="img"
                src={logoApp}
                alt="Protocolo Encomendas"
                sx={{
                  width: 64,
                  height: 64,
                  objectFit: "contain",
                  display: "block",
                  borderRadius: "12px",
                }}
              />
            </Box>
          </motion.div>
        )}

        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Heading */}
          <motion.div {...fadeUp(0.1)}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: "text.primary", mb: 0.5, letterSpacing: "-0.03em" }}
            >
              Bem-vindo de volta
            </Typography>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
              Entre na sua conta para continuar
            </Typography>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <motion.div {...fadeUp(0.25)}>
              <TextField
                label="E-mail"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                autoComplete="email"
                size="medium"
              />
            </motion.div>

            <motion.div {...fadeUp(0.32)}>
              <TextField
                label="Senha"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 1 }}
                autoComplete="current-password"
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            <motion.div {...fadeUp(0.38)}>
              <Box sx={{ textAlign: "right", mb: 3 }}>
                <Link
                  component={RouterLink}
                  to="/recuperar-senha"
                  variant="body2"
                  sx={{ color: "primary.main", fontWeight: 500 }}
                >
                  Esqueceu a senha?
                </Link>
              </Box>
            </motion.div>

            <motion.div {...fadeUp(0.44)}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mb: 2,
                  height: 52,
                  fontSize: "1rem",
                  letterSpacing: "0.02em",
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                    transform: "translateX(-100%)",
                    transition: "transform 0.6s",
                  },
                  "&:hover::after": {
                    transform: "translateX(100%)",
                  },
                }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </motion.div>

            <motion.div {...fadeUp(0.5)}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  my: 2.5,
                }}
              >
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                <Typography variant="caption" color="text.secondary">
                  ou
                </Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
              </Box>
            </motion.div>

            <motion.div {...fadeUp(0.55)}>
              <Typography variant="body2" textAlign="center" color="text.secondary">
                Não tem conta?{" "}
                <Link
                  component={RouterLink}
                  to="/cadastro"
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  Cadastre-se
                </Link>
              </Typography>
            </motion.div>

            <motion.div {...fadeUp(0.58)}>
              <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                <Link
                  component="a"
                  href={buildWhatsAppSupportUrl("login")}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.75,
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: 18, color: "#25D366" }} />
                  Estou com dúvida — falar com suporte
                </Link>
              </Typography>
            </motion.div>
          </Box>
        </Box>

        {/* Bottom brand tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          style={{ position: "absolute", bottom: 24 }}
        >
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            Protocolo Encomendas · PWA v1.0
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};
