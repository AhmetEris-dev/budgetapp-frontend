import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  Stack,
  Chip,
  Divider,
  Badge,
  Tooltip,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Outlet, Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ColorModeContext } from "../../app/providers";
import { authActions } from "../../features/auth/authSlice";
import { storage } from "../../utils/storage";
import { fetchAlertsThunk, markAlertReadThunk } from "../../features/alert/alertThunks";
import { swal } from "../../utils/swal";
import { fetchMe } from "../../features/user/userThunks";
import { alertTypeLabel } from "../../utils/labels";
import type { AlertType } from "../../types/alert";

type NavItem = { label: string; to: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { label: "Gösterge Paneli", to: "/dashboard", icon: <DashboardIcon /> },
  { label: "Bütçe", to: "/budget", icon: <AccountBalanceWalletIcon /> },
  { label: "Harcamalar", to: "/expenses", icon: <ReceiptLongIcon /> },
];

const LEFT_DRAWER_WIDTH = 300;
const RIGHT_DRAWER_WIDTH = 360;

function isCriticalType(t: AlertType): boolean {
  return t === "CRITICAL" || t === "BUDGET_EXCEEDED";
}

function isBudgetExceeded(t: AlertType): boolean {
  return t === "BUDGET_EXCEEDED";
}

export function AppShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { mode, toggle } = useContext(ColorModeContext);

  const me = useAppSelector((s) => s.user.me);
  const alerts = useAppSelector((s) => s.alert.pageData?.items ?? []);
  const activeAlertCount = alerts.length;

  const [navOpen, setNavOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const canPoll = useMemo(() => !!storage.getAccessToken(), []);

  // new-alert detection (avoid spam on first load)
  const initializedRef = useRef(false);
  const seenIdsRef = useRef<Set<number>>(new Set());

  // critical AppBar state
  const hasCritical = useMemo(() => alerts.some((a) => isCriticalType(a.type)), [alerts]);

  useEffect(() => {
    (async () => {
      if (!storage.getAccessToken()) return;
      await dispatch(fetchMe());
      await dispatch(fetchAlertsThunk({ status: "ACTIVE", page: 0, size: 10 }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // poll alerts
  useEffect(() => {
    if (!canPoll) return;

    const tick = async () => {
      await dispatch(fetchAlertsThunk({ status: "ACTIVE", page: 0, size: 10 }));
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPoll]);

  // refresh on route changes (cheap)
  useEffect(() => {
    if (!storage.getAccessToken()) return;
    dispatch(fetchAlertsThunk({ status: "ACTIVE", page: 0, size: 10 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ✅ NEW ALERT UX: toast + auto-open drawer (budget exceeded / critical)
  useEffect(() => {
    if (!storage.getAccessToken()) return;

    // first time: initialize baseline to avoid “new alerts” spam
    if (!initializedRef.current) {
      const baseline = new Set<number>(alerts.map((a) => a.id));
      seenIdsRef.current = baseline;
      initializedRef.current = true;
      return;
    }

    // compute truly new alerts by id
    const seen = seenIdsRef.current;
    const newlyArrived = alerts.filter((a) => !seen.has(a.id));

    // update seen set
    for (const a of alerts) seen.add(a.id);

    if (newlyArrived.length === 0) return;

    // toast for first new alert (don’t spam 10 toasts)
    const first = newlyArrived[0];
    const label = alertTypeLabel(first.type);

    if (isBudgetExceeded(first.type)) {
      swal.toastError("Bütçe Aşıldı", first.message);
      setAlertsOpen(true);
      return;
    }

    if (isCriticalType(first.type)) {
      swal.toastWarning("Kritik Uyarı", `${label}: ${first.message}`);
      setAlertsOpen(true);
      return;
    }

    swal.toastInfo("Yeni Bildirim", `${label}: ${first.message}`);
  }, [alerts]);

  const logout = async () => {
    const ok = await swal.confirm("Çıkış", "Çıkış yapmak istiyor musun?");
    if (!ok) return;

    storage.clearTokens();
    dispatch(authActions.loggedOut());
    navigate("/login", { replace: true });
    await swal.success("Çıkış yapıldı");
  };

  const markRead = async (id: number) => {
    const res = await dispatch(markAlertReadThunk(id));
    if (markAlertReadThunk.fulfilled.match(res)) {
      await dispatch(fetchAlertsThunk({ status: "ACTIVE", page: 0, size: 10 }));
      await swal.toastSuccess("Güncellendi", "Bildirim okundu olarak işaretlendi");
    } else {
      await swal.error("Hata", res.payload ?? "Bildirim güncellenemedi");
    }
  };

  const go = (to: string) => {
    navigate(to);
    setNavOpen(false);
  };

  const contentMl = navOpen ? LEFT_DRAWER_WIDTH : 0;
  const contentMr = alertsOpen ? RIGHT_DRAWER_WIDTH : 0;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 2,
          // ✅ critical highlight
          bgcolor: hasCritical ? "error.main" : "primary.main",
        }}
      >
        <Toolbar>
          <Tooltip title={navOpen ? "Menüyü Kapat" : "Menü"}>
            <IconButton color="inherit" edge="start" sx={{ mr: 1 }} onClick={() => setNavOpen((p) => !p)}>
              {navOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Tooltip>

          <Typography
            component={RouterLink}
            to="/dashboard"
            variant="h6"
            sx={{ color: "inherit", textDecoration: "none", fontWeight: 900, letterSpacing: 0.2, mr: 2 }}
          >
            BudgetApp
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === "dark" ? "Açık mod" : "Karanlık mod"}>
            <IconButton color="inherit" onClick={toggle}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={alertsOpen ? "Bildirimleri Kapat" : "Bildirimler"}>
            <IconButton color="inherit" onClick={() => setAlertsOpen((p) => !p)}>
              <Badge color="error" badgeContent={activeAlertCount}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Typography variant="body2" sx={{ ml: 2, opacity: 0.9 }}>
            {me?.fullName ? `Merhaba, ${me.fullName}` : ""}
          </Typography>

          <Tooltip title="Çıkış">
            <IconButton color="inherit" onClick={logout} sx={{ ml: 1 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* LEFT NAV (PUSH) */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={navOpen}
        sx={{
          width: LEFT_DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: LEFT_DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Menü
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Hızlı gezinme
              </Typography>
            </Box>

            <Tooltip title="Kapat">
              <IconButton onClick={() => setNavOpen(false)}>
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <List disablePadding>
            {NAV.map((item) => (
              <ListItemButton
                key={item.to}
                selected={location.pathname.startsWith(item.to)}
                onClick={() => go(item.to)}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* RIGHT ALERTS (PUSH) */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={alertsOpen}
        sx={{
          width: RIGHT_DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: RIGHT_DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={900}>
              Bildirimler
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" onClick={() => dispatch(fetchAlertsThunk({ status: "ACTIVE", page: 0, size: 10 }))}>
                Yenile
              </Button>
              <Tooltip title="Kapat">
                <IconButton onClick={() => setAlertsOpen(false)}>
                  <ChevronRightIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5, mb: 2 }}>
            Aktif uyarılar burada görünür.
          </Typography>

          {alerts.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Aktif bildirim yok.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {alerts.map((a, i) => (
                <Box key={a.id}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" label={alertTypeLabel(a.type)} />
                    <Typography variant="body2" fontWeight={800}>
                      {a.message}
                    </Typography>
                  </Stack>

                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {a.createdAt}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => markRead(a.id)}>
                      Okundu
                    </Button>
                  </Stack>

                  {i < alerts.length - 1 ? <Divider sx={{ my: 1.5 }} /> : null}
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Drawer>

      {/* MAIN CONTENT (SHIFT BOTH SIDES) */}
      <Box
        sx={{
          ml: `${contentMl}px`,
          mr: `${contentMr}px`,
          transition: (t) =>
            t.transitions.create(["margin-left", "margin-right"], {
              easing: t.transitions.easing.sharp,
              duration: t.transitions.duration.standard,
            }),
          p: { xs: 1, md: 2 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
