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
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        ml: { md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
        transition: "margin 0.25s cubic-bezier(0.4,0,0.2,1)",
        bgcolor: "background.default",
        boxSizing: "border-box",
        px: 2,
        pb: 2,
        pt: `calc(60px + ${theme.spacing(2)})`,
        [theme.breakpoints.up("sm")]: {
          pt: `calc(64px + ${theme.spacing(2)})`,
        },
        [theme.breakpoints.up("md")]: {
          px: 3,
          pb: 3,
          pt: `calc(64px + ${theme.spacing(3)})`,
        },
      })}
    >
      <AnimatedPage>
        <Outlet />
      </AnimatedPage>
    </Box>
  );
};
