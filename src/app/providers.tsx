import type { PropsWithChildren } from "react";
import React, { createContext, useMemo, useState } from "react";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { store } from "../store";
import { buildAppTheme } from "./theme";
import { themeStorage } from "../utils/theme";
import type { ThemeMode } from "../utils/theme";

type ColorModeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

export const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "light",
  toggle: () => {},
  setMode: () => {},
});

export function AppProviders({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>(themeStorage.get());

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    themeStorage.set(m);
  };

  const toggle = () => setMode(mode === "dark" ? "light" : "dark");

  const theme = useMemo(() => buildAppTheme(mode), [mode]);

  const ctxValue = useMemo(() => ({ mode, toggle, setMode }), [mode]);

  return (
    <Provider store={store}>
      <ColorModeContext.Provider value={ctxValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  );
}
