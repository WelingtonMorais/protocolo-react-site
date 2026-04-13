import React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScanner = ({ open, onClose, onScan }: QRScannerProps): React.JSX.Element => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerId = "qr-reader";

  const stopScanner = async (): Promise<void> => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // already stopped
      }
      try {
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setError(null);

    const startScanner = async (): Promise<void> => {
      await new Promise((r) => setTimeout(r, 200));
      if (!mounted) return;

      try {
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
          },
          () => undefined
        );
      } catch (err) {
        if (!mounted) return;
        const name = err instanceof Error ? err.name : String(err);
        if (name === "NotAllowedError" || name.includes("Permission")) {
          setError("Permissão de câmera negada. Permita o acesso à câmera nas configurações do navegador.");
        } else if (name === "NotFoundError" || name.includes("not found")) {
          setError("Nenhuma câmera encontrada neste dispositivo.");
        } else {
          setError("Não foi possível iniciar a câmera. Verifique as permissões e tente novamente.");
        }
      }
    };

    void startScanner();

    return () => {
      mounted = false;
      void stopScanner();
    };
  }, [open, onScan]);

  const handleClose = (): void => {
    void stopScanner();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <QrCodeScannerIcon />
        Escanear QR Code
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Aponte a câmera para o QR code do morador.
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box
            sx={{
              width: "100%",
              minHeight: 300,
              bgcolor: "#000",
              borderRadius: 2,
              overflow: "hidden",
              "& #qr-reader": { width: "100% !important" },
              "& #qr-reader video": { width: "100% !important", objectFit: "cover" },
            }}
          >
            <div id={containerId} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};
