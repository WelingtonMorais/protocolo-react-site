import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6034E1",
      light: "#8B5CF6",
      dark: "#4C1D95",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F7F5FF",
      paper: "#ffffff",
    },
    success: {
      main: "#10B981",
    },
    error: {
      main: "#EF4444",
    },
    warning: {
      main: "#F59E0B",
    },
    info: {
      main: "#6034E1",
    },
    text: {
      primary: "#1A1033",
      secondary: "#6B7280",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "11px 24px",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 8px 25px rgba(96,52,225,0.35)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #6034E1 0%, #8B5CF6 100%)",
          boxShadow: "0 4px 15px rgba(96,52,225,0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #4C1D95 0%, #6034E1 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(96,52,225,0.06)",
          borderRadius: 16,
          border: "1px solid rgba(96,52,225,0.08)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            transition: "box-shadow 0.2s",
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(96,52,225,0.15)",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid rgba(96,52,225,0.1)",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255,255,255,0.85)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0F0B1F",
          borderRight: "1px solid rgba(96,52,225,0.2)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "all 0.2s",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(96,52,225,0.1)",
        },
      },
    },
  },
});

export default theme;
