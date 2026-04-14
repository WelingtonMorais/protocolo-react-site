import React from "react";
import type { Transition } from "framer-motion";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBoxIcon from "@mui/icons-material/AddBox";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "@/providers/AuthProvider";
import logoApp from "../../../assets/logo_app.png";

const DRAWER_WIDTH = 240;

const operatorMenuItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/operador/dashboard" },
  { label: "Registrar Pacote", icon: <AddBoxIcon />, path: "/operador/registrar" },
  { label: "Entregar Pacote", icon: <QrCodeScannerIcon />, path: "/operador/entregar" },
  { label: "Pedidos de Acesso", icon: <PeopleIcon />, path: "/operador/pedidos" },
  { label: "Mensageiros", icon: <LocalShippingIcon />, path: "/operador/mensageiros" },
  { label: "Unidades", icon: <MeetingRoomIcon />, path: "/operador/unidades" },
  { label: "Condomínio", icon: <ApartmentIcon />, path: "/operador/condominio" },
  { label: "Moradores", icon: <PersonIcon />, path: "/operador/moradores" },
  { label: "Plano", icon: <CreditCardIcon />, path: "/operador/plano" },
  { label: "Notificacoes", icon: <NotificationsIcon />, path: "/notificacoes" },
  { label: "Configuracoes", icon: <SettingsIcon />, path: "/operador/configuracoes" },
];

const clientMenuItems = [
  { label: "Início", icon: <DashboardIcon />, path: "/morador/dashboard" },
  { label: "Meus Pacotes", icon: <Inventory2Icon />, path: "/morador/pacotes" },
  { label: "Histórico", icon: <HistoryIcon />, path: "/morador/historico" },
  { label: "Notificacoes", icon: <NotificationsIcon />, path: "/notificacoes" },
  { label: "Configurações", icon: <SettingsIcon />, path: "/morador/configuracoes" },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const ITEM_TRANSITION: Transition = { duration: 0.4, ease: EASE };

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: ITEM_TRANSITION },
};

export const AppSidebar = ({ open, onClose }: AppSidebarProps): React.JSX.Element => {
  const { user } = useAuth();
  const location = useLocation();
  const isOperator = user?.role === "EMPLOYEE" || user?.role === "ADMIN";
  const menuItems = isOperator ? operatorMenuItems : clientMenuItems;

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#0F0B1F",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 60, sm: 64 },
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "transparent",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            py: 0.75,
            px: 1.25,
            borderRadius: "9999px",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.04)",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.35), 0 2px 10px rgba(96,52,225,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <Box
            component="img"
            src={logoApp}
            alt="Protocolo Encomendas"
            sx={{
              height: 32,
              width: "auto",
              objectFit: "contain",
              display: "block",
              borderRadius: "10px",
              filter: "drop-shadow(0 0 6px rgba(96,52,225,0.45)) brightness(1.08)",
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.5)",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontSize: "0.65rem",
          }}
        >
          Protocolo
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(96,52,225,0.2)" }} />

      {/* User info */}
      <Box sx={{ px: 2, py: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
          }}
        >
          {isOperator ? "Operador" : "Morador"}
        </Typography>
        {user && (
          <Chip
            label={user.name}
            size="small"
            sx={{
              mt: 0.75,
              display: "block",
              maxWidth: "100%",
              bgcolor: "rgba(96,52,225,0.15)",
              color: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(96,52,225,0.3)",
              fontSize: "0.75rem",
              fontWeight: 500,
              "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
            }}
          />
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(96,52,225,0.12)" }} />

      {/* Navigation list with stagger animation */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingTop: 8 }}
      >
        <List disablePadding sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <motion.div key={item.path} variants={itemVariant}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={onClose}
                  selected={active}
                  sx={{
                    mb: 0.5,
                    borderRadius: 2,
                    py: 1.1,
                    position: "relative",
                    overflow: "hidden",
                    color: active ? "white" : "rgba(255,255,255,0.5)",
                    bgcolor: active ? "rgba(96,52,225,0.25)" : "transparent",
                    border: active ? "1px solid rgba(96,52,225,0.4)" : "1px solid transparent",
                    "&:hover": {
                      bgcolor: "rgba(96,52,225,0.15)",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                      borderColor: "rgba(96,52,225,0.3)",
                    },
                    "&.Mui-selected": {
                      bgcolor: "rgba(96,52,225,0.25)",
                      "&:hover": { bgcolor: "rgba(96,52,225,0.3)" },
                    },
                    transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  {/* Active glow line on left */}
                  {active && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 3,
                        bgcolor: "#6034E1",
                        borderRadius: "0 3px 3px 0",
                        boxShadow: "0 0 8px rgba(96,52,225,0.8)",
                      }}
                    />
                  )}
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: active ? "#8B5CF6" : "rgba(255,255,255,0.4)",
                      "& svg": { fontSize: 20 },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.85rem",
                      fontWeight: active ? 600 : 400,
                      letterSpacing: "0.01em",
                    }}
                  />
                </ListItemButton>
              </motion.div>
            );
          })}
        </List>
      </motion.div>

      <Divider sx={{ borderColor: "rgba(96,52,225,0.12)" }} />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.2)",
            fontSize: "0.65rem",
            letterSpacing: "0.05em",
          }}
        >
          Protocolo Encomendas v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            bgcolor: "#0F0B1F",
            borderRight: "1px solid rgba(96,52,225,0.2)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            bgcolor: "#0F0B1F",
            borderRight: "1px solid rgba(96,52,225,0.2)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
