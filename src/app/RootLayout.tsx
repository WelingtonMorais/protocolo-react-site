import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import theme from "@/config/muiTheme";
import { AuthProvider } from "@/providers/AuthProvider";
import { MenuProvider } from "@/providers/useMenu";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "@/assets/styles/global.css";

export const RootLayout = (): React.JSX.Element => {
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CustomCursor />
      <AuthProvider>
        <MenuProvider>
          <AnimatePresence mode="wait" initial={false}>
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </MenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
