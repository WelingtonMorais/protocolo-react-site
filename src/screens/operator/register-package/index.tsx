import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

import { api } from "@/services/api";
import type { Unit } from "@/types/operator.types";

export const RegisterPackageScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  const [unitId, setUnitId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUnits = async (): Promise<void> => {
      try {
        const response = await api.get<{ condominiumId: string; units: Unit[] }>(
          "/employee/condominiums"
        );
        const condominiumId =
          typeof response.data === "object" && !Array.isArray(response.data)
            ? (response.data as { id?: string }).id
            : undefined;
        if (condominiumId) {
          const unitsRes = await api.get<Unit[]>(
            `/employee/condominiums/${condominiumId}/units`
          );
          setUnits(unitsRes.data);
        }
      } catch {
        // units may be empty on first access
      } finally {
        setLoadingUnits(false);
      }
    };
    void fetchUnits();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let photoPath: string | undefined;
      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        const uploadRes = await api.post<{ path: string }>("/employee/packages/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        photoPath = uploadRes.data.path;
      }

      await api.post("/employee/packages", {
        unitId,
        recipientName: recipientName || undefined,
        carrier: carrier || undefined,
        trackingCode: trackingCode || undefined,
        photoPath,
      });

      setSuccess(true);
    } catch {
      setError("Erro ao registrar pacote. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}>
        <Card sx={{ maxWidth: 400, width: "100%" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" fontWeight={700} mb={1}>
              Pacote registrado!
            </Typography>
            <Typography color="text.secondary" mb={3}>
              O morador será notificado automaticamente.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setSuccess(false)}>
                Novo Pacote
              </Button>
              <Button variant="contained" fullWidth onClick={() => navigate("/operador/dashboard")}>
                Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" mb={0.5}>Registrar Pacote</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Registre a chegada de um novo pacote no condomínio.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Unidade"
              select
              fullWidth
              required
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loadingUnits}
              helperText={loadingUnits ? "Carregando unidades..." : undefined}
            >
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.block ? `Bloco ${u.block} - ` : ""}Ap. {u.number}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Nome do destinatário (opcional)"
              fullWidth
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Portadora / Transportadora"
              fullWidth
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Ex: Correios, Mercado Envios..."
            />

            <TextField
              label="Código de rastreio (opcional)"
              fullWidth
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" mb={1}>Foto do pacote (opcional)</Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />

            {photoPreview ? (
              <Box sx={{ position: "relative", mb: 2 }}>
                <Box
                  component="img"
                  src={photoPreview}
                  alt="Foto do pacote"
                  sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 2 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Trocar foto
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2, py: 2, borderStyle: "dashed" }}
                onClick={() => fileInputRef.current?.click()}
              >
                Tirar foto / Selecionar imagem
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !unitId}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Registrar Pacote"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
