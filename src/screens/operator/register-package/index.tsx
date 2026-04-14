import React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider as MuiDivider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import type { Courier, Unit } from "@/types/operator.types";
import { optimizeImageForUpload } from "@/utils/image-optimizer";

interface MembershipSearchRow {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
  unit: { id: string; number: string; block: string | null };
}

interface ListByCondominiumResponse {
  data: MembershipSearchRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UnitMemberRow {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
}

function formatUnitLabel(block: string | null | undefined, number: string): string {
  const b = block?.trim();
  if (!b || b === "-") return `Unidade ${number}`;
  return `Bloco ${b} · Unidade ${number}`;
}

function formatUnitsListLabel(u: Unit): string {
  return formatUnitLabel(u.block ?? null, u.number);
}

function apiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;
  const d = err.response?.data as {
    message?: string;
    issues?: {
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };
  };
  if (d?.message === "Validation error" && d.issues) {
    const fromFields = Object.values(d.issues.fieldErrors ?? {})
      .flat()
      .filter((x): x is string => typeof x === "string");
    const fromForm = (d.issues.formErrors ?? []).filter((x): x is string => typeof x === "string");
    const parts = [...fromFields, ...fromForm];
    if (parts.length) return parts.join(" ");
  }
  if (typeof d?.message === "string" && d.message !== "Validation error") return d.message;
  if (axios.isAxiosError(err) && err.message && err.message !== "Request failed with status code 400") {
    return err.message;
  }
  return fallback;
}

function buildDescription(base: string, carrier: string, tracking: string): string {
  const t = base.trim();
  const extras = [
    carrier.trim() && `Transportadora: ${carrier.trim()}`,
    tracking.trim() && `Rastreio: ${tracking.trim()}`,
  ].filter(Boolean) as string[];
  const merged = [t, ...extras].filter(Boolean).join(" · ");
  return merged.length >= 2 ? merged : t.length >= 2 ? t : merged;
}

export const RegisterPackageScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [condominiumId, setCondominiumId] = useState<string | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [noCondo, setNoCondo] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchOptions, setSearchOptions] = useState<MembershipSearchRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSelection, setSearchSelection] = useState<MembershipSearchRow | null>(null);

  const [unitId, setUnitId] = useState("");
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [unitMembers, setUnitMembers] = useState<UnitMemberRow[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [courierId, setCourierId] = useState("");

  const [description, setDescription] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadUnits = useCallback(async (): Promise<void> => {
    try {
      setLoadingUnits(true);
      setNoCondo(false);
      let cid = user?.condominiumId ?? null;
      if (!cid) {
        const meRes = await api.get<{ id: string } | null>("/employee/condominiums/me");
        cid = meRes.data?.id ?? null;
      }
      if (!cid) {
        setNoCondo(true);
        setCondominiumId(null);
        setUnits([]);
        return;
      }
      setCondominiumId(cid);
      const unitsRes = await api.get<Unit[]>(`/employee/condominiums/${cid}/units`);
      setUnits(unitsRes.data);
    } catch {
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  }, [user?.condominiumId]);

  const loadCouriers = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get<Courier[]>("/employee/couriers");
      setCouriers(response.data ?? []);
    } catch {
      setCouriers([]);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    void loadUnits();
    void loadCouriers();
  }, [authLoading, loadUnits, loadCouriers]);

  useEffect(() => {
    if (error) scrollAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [error]);

  const fetchUnitMembers = useCallback(async (uid: string): Promise<void> => {
    if (!uid) {
      setUnitMembers([]);
      return;
    }
    setLoadingMembers(true);
    try {
      const res = await api.get<UnitMemberRow[]>(`/employee/memberships/units/${uid}/members`);
      const list = Array.isArray(res.data) ? res.data : [];
      setUnitMembers(list);
      if (list.length === 1) {
        setReceiverId(list[0]!.userId);
      } else if (list.length === 0) {
        setReceiverId(null);
      }
    } catch {
      setUnitMembers([]);
      setReceiverId(null);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    if (!unitId) {
      setUnitMembers([]);
      setReceiverId(null);
      return;
    }
    void fetchUnitMembers(unitId);
  }, [unitId, fetchUnitMembers]);

  useEffect(() => {
    if (!condominiumId || searchInput.trim().length < 1) {
      setSearchOptions([]);
      setSearchLoading(false);
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const q = searchInput.trim();
      if (q.length < 1) {
        setSearchOptions([]);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      const params = new URLSearchParams({ search: q, limit: "20", page: "1" });
      void api
        .get<ListByCondominiumResponse>(
          `/employee/memberships/condominiums/${condominiumId}/members?${params.toString()}`
        )
        .then((res) => {
          setSearchOptions(res.data.data ?? []);
        })
        .catch(() => {
          setSearchOptions([]);
        })
        .finally(() => {
          setSearchLoading(false);
        });
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput, condominiumId]);

  const finalDescription = useMemo(
    () => buildDescription(description, carrier, trackingCode),
    [description, carrier, trackingCode]
  );

  const canSubmit = useMemo(() => {
    if (!unitId || finalDescription.length < 2 || !courierId) return false;
    if (unitMembers.length > 0 && !receiverId) return false;
    return true;
  }, [unitId, finalDescription.length, unitMembers.length, receiverId, courierId]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimizedResult = await optimizeImageForUpload(file);
      const optimized = optimizedResult.file;
      const nextPreview = URL.createObjectURL(optimized);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhoto(optimized);
      setPhotoPreview(nextPreview);
    } catch {
      // Fallback to original file if optimization fails for any reason.
      const nextPreview = URL.createObjectURL(file);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhoto(file);
      setPhotoPreview(nextPreview);
    }
  };

  const handleSearchPick = (_: unknown, value: MembershipSearchRow | null): void => {
    setSearchSelection(value);
    if (value) {
      setSearchInput(`${value.user.name} — ${formatUnitLabel(value.unit.block, value.unit.number)}`);
      setUnitId(value.unit.id);
      setReceiverId(value.userId);
    } else {
      setSearchInput("");
      setUnitId("");
      setReceiverId(null);
    }
  };

  const handleManualUnitChange = (uid: string): void => {
    setSearchSelection(null);
    setSearchInput("");
    setUnitId(uid);
    setReceiverId(null);
  };

  const resetForm = (): void => {
    setSearchInput("");
    setSearchOptions([]);
    setSearchSelection(null);
    setUnitId("");
    setReceiverId(null);
    setUnitMembers([]);
    setDescription("");
    setCarrier("");
    setTrackingCode("");
    setCourierId("");
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    if (!unitId) {
      setError("Selecione a unidade ou busque um morador.");
      return;
    }
    if (finalDescription.length < 2) {
      setError("A descrição deve ter pelo menos 2 caracteres (inclua transportadora/rastreio se quiser).");
      return;
    }
    if (unitMembers.length > 0 && !receiverId) {
      setError("Selecione o morador destinatário.");
      return;
    }
    if (!courierId) {
      setError("Selecione o mensageiro responsavel.");
      return;
    }
    setLoading(true);
    try {
      let photoUrl: string | null = null;
      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        const uploadRes = await api.post<{ url: string }>("/employee/packages/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        photoUrl = uploadRes.data.url ?? null;
      }

      await api.post("/employee/packages", {
        unitId,
        description: finalDescription,
        receiverId: receiverId || null,
        photoUrl,
        courierId,
      });

      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao registrar pacote. Verifique os dados e tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const scrollAreaSx = {
    maxWidth: 560,
    mx: "auto" as const,
    width: "100%",
    maxHeight: { xs: "calc(100dvh - 96px)", md: "calc(100dvh - 112px)" },
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch" as const,
    pb: 2,
  };

  if (success) {
    return (
      <Box sx={{ ...scrollAreaSx, display: "flex", justifyContent: "center", pt: 6 }}>
        <Card sx={{ maxWidth: 400, width: "100%" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" fontWeight={700} mb={1}>
              Pacote registrado!
            </Typography>
            <Typography color="text.secondary" mb={3}>
              O morador será notificado automaticamente quando houver destinatário vinculado.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSuccess(false);
                  void loadUnits();
                }}
              >
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
    <Box ref={scrollAreaRef} sx={scrollAreaSx}>
      <Typography variant="h5" mb={0.5}>Registrar Pacote</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Busque por morador ou unidade, confirme o destinatário e descreva a encomenda.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {noCondo && !loadingUnits && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/operador/condominio")}>
              Meu condomínio
            </Button>
          }
        >
          Crie seu condomínio para registrar encomendas.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Buscar morador
            </Typography>
            <Autocomplete
              fullWidth
              disabled={loadingUnits || noCondo || !condominiumId}
              options={searchOptions}
              loading={searchLoading}
              filterOptions={(opts) => opts}
              getOptionLabel={(row) =>
                `${row.user.name} — ${formatUnitLabel(row.unit.block, row.unit.number)}`
              }
              inputValue={searchInput}
              onInputChange={(_, v) => setSearchInput(v)}
              value={searchSelection}
              onChange={handleSearchPick}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              noOptionsText={
                searchInput.trim().length < 1 ? "Digite nome, e-mail ou unidade" : "Nenhum morador encontrado"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Morador ou unidade"
                  placeholder="Nome, e-mail, bloco ou número"
                  helperText="Busca entre moradores já vinculados ao condomínio."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ mb: 2 }}
            />

            {unitId && (
              <Box sx={{ mb: 2 }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 600 }}>
                  Destinatário {loadingMembers && <CircularProgress size={16} sx={{ ml: 1, verticalAlign: "middle" }} />}
                </FormLabel>
                {unitMembers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum morador vinculado a esta unidade. A encomenda será registrada sem destinatário
                    específico.
                  </Typography>
                ) : (
                  <RadioGroup
                    value={receiverId ?? ""}
                    onChange={(e) => setReceiverId(e.target.value || null)}
                  >
                    {unitMembers.map((m, index) => (
                      <Box key={m.id}>
                        <FormControlLabel
                          sx={{ width: "100%", py: 0.75, m: 0, alignItems: "flex-start" }}
                          value={m.userId}
                          control={<Radio size="small" sx={{ mt: 0.25 }} />}
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {m.user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {m.user.email}
                              </Typography>
                            </Box>
                          }
                        />
                        {index < unitMembers.length - 1 && <MuiDivider sx={{ ml: 4.5 }} />}
                      </Box>
                    ))}
                  </RadioGroup>
                )}
              </Box>
            )}

            <Accordion disableGutters elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 2, "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Ou escolha a unidade manualmente</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  label="Unidade"
                  select
                  fullWidth
                  value={unitId}
                  onChange={(e) => handleManualUnitChange(e.target.value)}
                  disabled={loadingUnits || noCondo}
                  helperText="Lista completa de unidades do condomínio"
                >
                  <MenuItem value="">
                    <em>Selecione</em>
                  </MenuItem>
                  {units.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {formatUnitsListLabel(u)}
                    </MenuItem>
                  ))}
                </TextField>
              </AccordionDetails>
            </Accordion>

            <TextField
              label="Mensageiro responsavel"
              select
              fullWidth
              required
              value={courierId}
              onChange={(e) => setCourierId(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Obrigatorio para rastrear quem registrou a entrada."
            >
              <MenuItem value="">
                <em>Selecione</em>
              </MenuItem>
              {couriers.map((courier) => (
                <MenuItem key={courier.id} value={courier.id}>
                  {courier.name} - token {courier.token}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Descrição da encomenda"
              fullWidth
              required
              multiline
              minRows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Ex: Caixa média, frágil"
              helperText="Mínimo 2 caracteres. Transportadora e rastreio abaixo entram junto na descrição."
            />

            <TextField
              label="Transportadora (opcional)"
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
              onChange={(e) => {
                void handlePhotoChange(e);
              }}
            />

            {photoPreview ? (
              <Box sx={{ position: "relative", mb: 2 }}>
                <Box
                  component="img"
                  src={photoPreview}
                  alt="Foto do pacote"
                  loading="lazy"
                  decoding="async"
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
              disabled={loading || loadingUnits || noCondo || !canSubmit}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Registrar Pacote"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
