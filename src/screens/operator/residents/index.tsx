import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";

interface Member {
  id: string;
  name: string;
  email: string;
  unit?: { number: string; block?: string };
  status: string;
}

interface MembershipRow {
  id: string;
  user: { name: string; email: string };
  unit: { number: string; block: string | null } | null;
}

interface ListByCondominiumResponse {
  data: MembershipRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ResidentsScreen = (): React.JSX.Element => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noCondo, setNoCondo] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;

    const load = async (): Promise<void> => {
      try {
        setNoCondo(false);
        let cid = user?.condominiumId;
        if (!cid) {
          const meRes = await api.get<{ id: string } | null>("/employee/condominiums/me");
          cid = meRes.data?.id;
        }
        if (!cid) {
          setNoCondo(true);
          setMembers([]);
          setFiltered([]);
          return;
        }

        const res = await api.get<ListByCondominiumResponse>(
          `/employee/memberships/condominiums/${cid}/members?limit=500&page=1`
        );
        const rows = res.data.data ?? [];
        const mapped: Member[] = rows.map((m) => ({
          id: m.id,
          name: m.user.name,
          email: m.user.email,
          unit: m.unit
            ? { number: m.unit.number, block: m.unit.block ?? undefined }
            : undefined,
          status: "Ativo",
        }));
        setMembers(mapped);
        setFiltered(mapped);
      } catch (err) {
        const msg =
          axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : "Erro ao carregar moradores.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [authLoading, user?.condominiumId]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.unit?.number.includes(q)
      )
    );
  }, [search, members]);

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>Moradores</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Todos os moradores vinculados ao condomínio.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {noCondo && !error && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/operador/condominio")}>
              Meu condomínio
            </Button>
          }
        >
          Crie e configure seu condomínio para listar os moradores vinculados.
        </Alert>
      )}

      <Card>
        <CardContent>
          <TextField
            placeholder="Buscar por nome, e-mail ou unidade..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : noCondo ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Nenhum condomínio associado à sua conta ainda.
            </Typography>
          ) : filtered.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              {search ? "Nenhum resultado encontrado." : "Nenhum morador cadastrado."}
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Morador</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: "primary.light" }}>
                            {member.name[0]?.toUpperCase()}
                          </Avatar>
                          {member.name}
                        </Box>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {member.unit
                          ? `${member.unit.block ? member.unit.block + " / " : ""}${member.unit.number}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Chip label={member.status} size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
