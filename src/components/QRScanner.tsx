import React from "react";
import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
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
  const containerId = "qr-reader";

  useEffect(() => {
    if (!open) return;

    let mounted = true;

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
      } catch {
        // Camera permission denied or not available
      }
    };

    void startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => undefined);
        scannerRef.current = null;
      }
    };
  }, [open, onScan]);

  const handleClose = (): void => {
    if (scannerRef.current) {
      void scannerRef.current.stop().catch(() => undefined);
      scannerRef.current = null;
    }
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};
