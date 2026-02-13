export type ThemeMode = "light" | "dark";

const KEY = "budgetapp_theme_mode";

export const themeStorage = {
  get(): ThemeMode {
    const v = localStorage.getItem(KEY);
    return v === "dark" ? "dark" : "light";
  },
  set(mode: ThemeMode) {
    localStorage.setItem(KEY, mode);
  },
};
