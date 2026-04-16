import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SwipeIcon from "@mui/icons-material/Swipe";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

import { api, resolveApiAssetUrl } from "@/services/api";
import { type ClientPackage, parseClientPackagesResponse } from "@/types/client.types";

export const PackagesScreen = (): React.JSX.Element => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = useState(0);
  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ClientPackage[] | { packages: ClientPackage[] }>("/client/packages");
      setPackages(parseClientPackagesResponse(response.data));
    } catch {
      setError("Erro ao carregar pacotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  const pending = packages.filter((p) => p.status === "WAITING_PICKUP");
  const delivered = packages.filter((p) => p.status === "DELIVERED");
  const displayed = tab === 0 ? pending : delivered;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Meus Pacotes</Typography>
          <Typography variant="body2" color="text.secondary">
            {pending.length} aguardando retirada
          </Typography>
        </Box>
        <Tooltip title="Atualizar">
          <IconButton onClick={() => void refetch()} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ mb: isMobile ? 1 : 3 }}>
        <Tab label={`Aguardando (${pending.length})`} />
        <Tab label={`Entregues (${delivered.length})`} />
      </Tabs>

      {isMobile && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2, opacity: 0.5 }}>
          <SwipeIcon fontSize="small" />
          <Typography variant="caption">Toque nas abas para alternar entre pendentes e entregues</Typography>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            {tab === 0 ? (
              <LocalShippingIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            ) : (
              <CheckCircleIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            )}
            <Typography color="text.secondary">
              {tab === 0 ? "Nenhum pacote aguardando retirada." : "Nenhum pacote entregue."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {displayed.map((pkg) => (
            <Grid item xs={12} sm={6} key={pkg.id}>
              <Card
                sx={{
                  cursor: tab === 0 ? "pointer" : "default",
                  "&:hover": tab === 0 ? { boxShadow: 4 } : {},
                }}
                onClick={() => tab === 0 && navigate(`/morador/pacotes/${pkg.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Chip
                      label={pkg.status === "WAITING_PICKUP" ? "Aguardando" : "Entregue"}
                      color={pkg.status === "WAITING_PICKUP" ? "warning" : "success"}
                      size="small"
                    />
                    {tab === 0 && (
                      <Tooltip title="Ver QR code">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/morador/pacotes/${pkg.id}`);
                          }}
                        >
                          <QrCode2Icon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {resolveApiAssetUrl(pkg.photoUrl) && (
                    <Box
                      component="img"
                      src={resolveApiAssetUrl(pkg.photoUrl)}
                      alt="Foto do pacote"
                      loading="lazy"
                      decoding="async"
                      sx={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 1,
                        mb: 1.5,
                      }}
                    />
                  )}

                  <Typography variant="body2" fontWeight={600}>
                    {pkg.condominium?.name ?? "Condomínio"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pkg.unit?.block ? `Bloco ${pkg.unit.block} - ` : ""}
                    {pkg.unit?.number ? `Unidade ${pkg.unit.number}` : ""}
                  </Typography>
                  {pkg.carrier && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Portadora: {pkg.carrier}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled">
                    {new Date(pkg.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
