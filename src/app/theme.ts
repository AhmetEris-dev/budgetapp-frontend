import { createTheme } from "@mui/material/styles";
import type { ThemeMode } from "../utils/theme";

export function buildAppTheme(mode: ThemeMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: "#1976d2" },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12, textTransform: "none", fontWeight: 700 },
        },
      },
    },
  });
}
