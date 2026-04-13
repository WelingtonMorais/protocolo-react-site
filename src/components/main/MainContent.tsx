import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { AnimatedPage } from "@/components/ui/AnimatedPage";

const DRAWER_WIDTH = 240;

interface MainContentProps {
  drawerOpen: boolean;
}

export const MainContent = ({ drawerOpen }: MainContentProps): React.JSX.Element => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        mt: "64px",
        ml: { md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
        transition: "margin 0.25s cubic-bezier(0.4,0,0.2,1)",
        minHeight: "calc(100vh - 64px)",
        bgcolor: "background.default",
      }}
    >
      <AnimatedPage>
        <Outlet />
      </AnimatedPage>
    </Box>
  );
};
