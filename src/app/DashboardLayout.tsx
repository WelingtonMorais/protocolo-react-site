import React from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppHeader } from "@/components/header/AppHeader";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { MainContent } from "@/components/main/MainContent";
import { useMenu } from "@/providers/useMenu";

export const DashboardLayout = (): React.JSX.Element => {
  const { open, closeMenu } = useMenu();
  const location = useLocation();

  return (
    <Box
      sx={{
        display: "flex",
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <AppHeader drawerOpen={open} />
      <AppSidebar open={open} onClose={closeMenu} />
      <AnimatePresence mode="wait" initial={false}>
        <MainContent key={location.pathname} drawerOpen={open} />
      </AnimatePresence>
    </Box>
  );
};
