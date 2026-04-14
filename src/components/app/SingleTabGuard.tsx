import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

import { useAuth } from "@/providers/AuthProvider";

const OWNER_KEY = "protocolo:active-tab-owner";
const TAB_ID_KEY = "protocolo:tab-id";
const HEARTBEAT_MS = 2000;
const LEASE_MS = 6000;

type OwnerPayload = {
  id: string;
  expiresAt: number;
};

function safeParseOwner(raw: string | null): OwnerPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OwnerPayload;
    if (!parsed?.id || typeof parsed.expiresAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function ensureTabId(): string {
  const existing = sessionStorage.getItem(TAB_ID_KEY);
  if (existing) return existing;
  const created = `tab-${crypto.randomUUID()}`;
  sessionStorage.setItem(TAB_ID_KEY, created);
  return created;
}

export const SingleTabGuard = (): React.JSX.Element | null => {
  const { isAuthenticated } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const tabIdRef = useRef<string>("");
  const heartbeatRef = useRef<number | null>(null);

  const claimOwnership = useCallback((): void => {
    const payload: OwnerPayload = {
      id: tabIdRef.current,
      expiresAt: Date.now() + LEASE_MS,
    };
    localStorage.setItem(OWNER_KEY, JSON.stringify(payload));
    setIsBlocked(false);
  }, []);

  const checkOwnership = useCallback((): void => {
    const owner = safeParseOwner(localStorage.getItem(OWNER_KEY));
    const now = Date.now();
    if (!owner || owner.expiresAt < now || owner.id === tabIdRef.current) {
      claimOwnership();
      return;
    }
    setIsBlocked(true);
  }, [claimOwnership]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsBlocked(false);
      if (heartbeatRef.current !== null) {
        window.clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      return;
    }

    tabIdRef.current = ensureTabId();
    checkOwnership();

    heartbeatRef.current = window.setInterval(() => {
      checkOwnership();
    }, HEARTBEAT_MS);

    const onStorage = (event: StorageEvent): void => {
      if (event.key !== OWNER_KEY) return;
      checkOwnership();
    };

    const onBeforeUnload = (): void => {
      const owner = safeParseOwner(localStorage.getItem(OWNER_KEY));
      if (owner?.id === tabIdRef.current) {
        localStorage.removeItem(OWNER_KEY);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (heartbeatRef.current !== null) {
        window.clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [isAuthenticated, checkOwnership]);

  const roleLabel = useMemo(() => "morador e operador", []);

  if (!isAuthenticated) return null;

  return (
    <Dialog open={isBlocked} maxWidth="sm" fullWidth>
      <DialogTitle>Aplicativo ja aberto em outra guia</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Typography variant="body1">
            Para evitar acoes duplicadas e inconsistencias, permitimos uso em uma guia por vez para {roleLabel}.
          </Typography>
          <Alert severity="warning">
            Esta guia esta em modo bloqueado porque outra guia ativa foi detectada.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => window.close()}>
          Fechar guia
        </Button>
        <Button variant="contained" onClick={claimOwnership}>
          Assumir nesta guia
        </Button>
      </DialogActions>
    </Dialog>
  );
};
