import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useMenu } from "@/providers/useMenu";
import { useAuth } from "@/providers/AuthProvider";
import { useNotificationUI } from "@/providers/NotificationUIProvider";
import logoApp from "../../../assets/logo_app.png";

const DRAWER_WIDTH = 240;

interface AppHeaderProps {
  drawerOpen: boolean;
}

export const AppHeader = ({ drawerOpen }: AppHeaderProps): React.JSX.Element => {
  const navigate = useNavigate();
  const { toggleMenu } = useMenu();
  const { user, logout } = useAuth();
  const { hasUnread } = useNotificationUI();

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "U";

  const notifTooltip = "Ver notificacoes";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        width: { md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%" },
        ml: { md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), margin 0.25s cubic-bezier(0.4,0,0.2,1)",
        bgcolor: "rgba(247,245,255,0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(96,52,225,0.1)",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 60, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
        {/* Menu toggle */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleMenu}
          sx={{
            mr: 2,
            color: "text.secondary",
            "&:hover": { color: "primary.main", bgcolor: "rgba(96,52,225,0.08)" },
          }}
        >
          <motion.div
            animate={{ rotate: drawerOpen ? 90 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <MenuIcon />
          </motion.div>
        </IconButton>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box
            component="img"
            src={logoApp}
            alt="Protocolo Encomendas"
            sx={{
              height: 34,
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 1px 4px rgba(96,52,225,0.2))",
            }}
          />
        </motion.div>

        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title={notifTooltip}>
            <IconButton
              onClick={() => navigate("/notificacoes")}
              sx={{
                color: hasUnread ? "primary.main" : "text.secondary",
                "&:hover": { color: "primary.main", bgcolor: "rgba(96,52,225,0.08)" },
              }}
            >
              <Badge
                variant="dot"
                color="success"
                invisible={!hasUnread}
                sx={{ "& .MuiBadge-dot": { width: 8, height: 8, borderRadius: "50%" } }}
              >
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Tooltip title={user?.name ?? "Usuário"}>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #6034E1 0%, #8B5CF6 100%)",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(96,52,225,0.35)",
                }}
              >
                {initials}
              </Avatar>
            </motion.div>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Sair">
            <IconButton
              onClick={logout}
              size="small"
              sx={{
                ml: 0.5,
                color: "text.secondary",
                "&:hover": { color: "error.main", bgcolor: "rgba(239,68,68,0.08)" },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

    </AppBar>
  );
};
