import React from "react";
import { Box } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
  value: string;
  size?: number;
}

export const QRDisplay = ({ value, size = 200 }: QRDisplayProps): React.JSX.Element => {
  return (
    <Box
      sx={{
        display: "inline-flex",
        p: 2,
        bgcolor: "white",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <QRCodeSVG value={value} size={size} />
    </Box>
  );
};
