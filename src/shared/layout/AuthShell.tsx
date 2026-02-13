import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Outlet, Link as RouterLink } from "react-router-dom";
import { ColorModeContext } from "../../app/providers";

export function AuthShell() {
  const { mode, toggle } = useContext(ColorModeContext);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar>
          <Typography
            component={RouterLink}
            to="/login"
            variant="h6"
            sx={{
              textDecoration: "none",
              fontWeight: 900,
              color: "text.primary",
              letterSpacing: 0.2,
            }}
          >
            BudgetApp
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === "dark" ? "Açık mod" : "Karanlık mod"}>
            <IconButton onClick={toggle} color="inherit">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Outlet />
    </Box>
  );
}
