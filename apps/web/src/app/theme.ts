import { alpha, createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0A6ED1",
      dark: "#084B8F",
      light: "#E4F0FF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0A9A70",
      dark: "#06795A",
      light: "#DFF7EF",
    },
    warning: {
      main: "#E49B1C",
    },
    error: {
      main: "#D9473E",
    },
    background: {
      default: "#EEF3FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#10233C",
      secondary: "#617389",
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: [
      "Plus Jakarta Sans",
      "Manrope",
      "Segoe UI",
      "-apple-system",
      "BlinkMacSystemFont",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 800, letterSpacing: -0.3 },
    h5: { fontWeight: 800, letterSpacing: -0.2 },
    h6: { fontWeight: 750, letterSpacing: -0.1 },
    button: { fontWeight: 700, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          minWidth: 320,
          minHeight: "100vh",
          backgroundColor: "#EEF3FA",
          color: "#10233C",
        },
        "#root": {
          minHeight: "100vh",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 12, fontWeight: 700, boxShadow: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${alpha("#0A6ED1", 0.11)}`,
          boxShadow: "0 10px 34px rgba(16,35,60,0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
  },
});
