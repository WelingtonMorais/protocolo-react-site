import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeIcon from "@mui/icons-material/Home";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import type { RegisterClientData, RegisterEmployeeData } from "@/types/auth.types";
import logoApp from "../../../assets/logo_app.png";

type ProfileType = "CLIENT" | "EMPLOYEE";
const steps = ["Perfil", "Dados", "Pronto"];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: EASE },
});

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -50 : 50 }),
};

export const RegisterScreen = (): React.JSX.Element => {
  const { registerClient, registerEmployee, logout } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [profile, setProfile] = useState<ProfileType>("CLIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = (): void => {
    setDirection(1);
    setActiveStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = { name, email, phone, password };
      if (profile === "CLIENT") {
        await registerClient(data as RegisterClientData);
      } else {
        await registerEmployee(data as RegisterEmployeeData);
      }
      setDirection(1);
      setActiveStep(2);
    } catch (err: unknown) {
      const ax = err as {
        response?: {
          data?: {
            message?: string;
            issues?: { fieldErrors?: Record<string, string[]> };
          };
        };
      };
      const msg = ax.response?.data?.message;
      const fe = ax.response?.data?.issues?.fieldErrors;
      const bodyIssues = fe?.body;
      const firstIssue =
        Array.isArray(bodyIssues) && bodyIssues.length > 0 ? bodyIssues[0] : undefined;
      setError(
        typeof msg === "string" && msg.length > 0 && msg !== "Validation error"
          ? msg
          : typeof firstIssue === "string"
            ? firstIssue
            : "Erro ao criar conta. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const sideWords = ["Crie", "sua", "conta", "agora."];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* ── LEFT PANEL ── */}
      {!isMobile && (
        <Box
          className="auth-side-left"
          sx={{
            width: { md: "44%", lg: "48%" },
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

          <Box sx={{ position: "relative", zIndex: 1, maxWidth: 380, width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] }}
              style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}
            >
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <Box
                  sx={{
                    position: "absolute",
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    border: "1px dashed rgba(96,52,225,0.4)",
                    animation: "spinOrbit 12s linear infinite",
                  }}
                />
                <Box
                  component="img"
                  src={logoApp}
                  alt="Logo"
                  sx={{
                    width: 66,
                    height: 66,
                    objectFit: "contain",
                    filter: "drop-shadow(0 0 18px rgba(96,52,225,0.45))",
                    position: "relative",
                    zIndex: 1,
                    margin: "27px",
                  }}
                />
              </Box>
            </motion.div>

            <Typography
              variant="h2"
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: { md: "1.9rem", lg: "2.3rem" },
                lineHeight: 1.3,
                letterSpacing: "-0.03em",
                mb: 2,
              }}
            >
              {sideWords.map((word, i) => (
                <span key={i} className="split-title-word">
                  <motion.span
                    style={{ display: "inline-block" }}
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.4 + i * 0.1,
                      ease: EASE,
                    }}
                  >
                    {word}
                  </motion.span>{" "}
                </span>
              ))}
            </Typography>

            <motion.div {...fadeUp(1.0)}>
              <Typography sx={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                Operadores e moradores em uma plataforma unificada, acessível de qualquer dispositivo.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0, transformOrigin: "left center" }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
              style={{
                height: 1,
                background: "linear-gradient(90deg, rgba(96,52,225,0.8) 0%, transparent 100%)",
                marginTop: 28,
                transformOrigin: "left center",
              }}
            />

            {/* Step progress visual */}
            <motion.div {...fadeUp(1.6)}>
              <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
                {steps.map((s, i) => (
                  <Box
                    key={s}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      opacity: i === activeStep ? 1 : 0.35,
                      transition: "opacity 0.4s",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: i === activeStep ? "#6034E1" : "rgba(255,255,255,0.4)",
                        transition: "background 0.4s",
                        boxShadow: i === activeStep ? "0 0 8px rgba(96,52,225,0.8)" : "none",
                      }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                      {s}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Box>
      )}

      {/* ── RIGHT PANEL ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F7F5FF",
          p: { xs: 3, md: 6 },
        }}
      >
        {isMobile && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] }}>
            <Box component="img" src={logoApp} alt="Logo" sx={{ width: 56, height: 56, objectFit: "contain", mb: 2 }} />
          </motion.div>
        )}

        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <motion.div {...fadeUp(0.05)}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.03em", mb: 0.5 }}>
              Criar Conta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Protocolo Encomendas
            </Typography>
          </motion.div>

          <motion.div {...fadeUp(0.12)}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                mb: 4,
                "& .MuiStepLabel-label": { fontSize: "0.75rem" },
                "& .MuiStepIcon-root.Mui-active": { color: "primary.main" },
                "& .MuiStepIcon-root.Mui-completed": { color: "primary.main" },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Animated step content */}
          <AnimatePresence mode="wait" custom={direction}>
            {activeStep === 0 && (
              <motion.div
                key="step0"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Typography variant="subtitle1" fontWeight={700} mb={3} sx={{ letterSpacing: "-0.01em" }}>
                  Qual é o seu perfil?
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                  {[
                    { value: "CLIENT" as ProfileType, icon: <HomeIcon sx={{ fontSize: 32 }} />, title: "Sou Morador", sub: "Recebo encomendas" },
                    { value: "EMPLOYEE" as ProfileType, icon: <ApartmentIcon sx={{ fontSize: 32 }} />, title: "Sou Operador", sub: "Gerencio o condomínio" },
                  ].map((opt) => (
                    <Box
                      key={opt.value}
                      onClick={() => setProfile(opt.value)}
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1.5,
                        py: 3.5,
                        px: 2,
                        borderRadius: 3,
                        border: "2px solid",
                        borderColor: profile === opt.value ? "primary.main" : "rgba(96,52,225,0.15)",
                        bgcolor: profile === opt.value ? "rgba(96,52,225,0.06)" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: profile === opt.value ? "0 0 0 4px rgba(96,52,225,0.1)" : "none",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "rgba(96,52,225,0.04)",
                        },
                      }}
                    >
                      <Box sx={{ color: profile === opt.value ? "primary.main" : "text.secondary" }}>
                        {opt.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={700} color={profile === opt.value ? "primary.main" : "text.primary"}>
                        {opt.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        {opt.sub}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button variant="contained" fullWidth size="large" onClick={goNext} sx={{ height: 52 }}>
                  Continuar
                </Button>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    label="Nome completo"
                    fullWidth
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                    size="medium"
                  />
                  <TextField
                    label="E-mail"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                    size="medium"
                  />
                  <TextField
                    label="Telefone"
                    fullWidth
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    sx={{ mb: 2 }}
                    size="medium"
                    placeholder="(00) 00000-0000"
                  />
                  <TextField
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 3 }}
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
                  <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ height: 52 }}>
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </Box>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{ fontSize: 72, color: "primary.main", mb: 2 }}
                    />
                  </motion.div>
                  <motion.div {...fadeUp(0.3)}>
                    <Typography variant="h5" fontWeight={800} mb={1}>
                      Conta criada!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={4}>
                      Sua conta foi criada com sucesso. Você já pode entrar.
                    </Typography>
                  </motion.div>
                  <motion.div {...fadeUp(0.5)}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() =>
                        navigate(
                          profile === "CLIENT" ? "/morador/dashboard" : "/operador/dashboard",
                          { replace: true }
                        )
                      }
                      sx={{ height: 52 }}
                    >
                      Ir para o painel
                    </Button>
                  </motion.div>
                  <motion.div {...fadeUp(0.62)}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Quer entrar com outra conta?{" "}
                      <Link
                        component="button"
                        type="button"
                        onClick={() => {
                          logout();
                          navigate("/", { replace: true });
                        }}
                        sx={{ fontWeight: 700, verticalAlign: "baseline" }}
                      >
                        Sair e ir ao login
                      </Link>
                    </Typography>
                  </motion.div>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div {...fadeUp(0.6)}>
            <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
              Já tem conta?{" "}
              <Link component={RouterLink} to="/" sx={{ color: "primary.main", fontWeight: 700 }}>
                Entrar
              </Link>
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};
