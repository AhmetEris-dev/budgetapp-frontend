import {
  Box,
  Chip,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { SectionCard } from "../../../shared/ui/SectionCard";
import { LoadingButton } from "../../../shared/ui/LoadingButton";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchAlertsThunk, markAlertReadThunk } from "../alertThunks";
import { swal } from "../../../utils/swal";
import { useEffect, useState } from "react";
import type { AlertStatus } from "../../../types/alert";
import { alertTypeLabel } from "../../../utils/labels";

const statusLabel = (s: AlertStatus) => (s === "ACTIVE" ? "Aktif" : "Okundu");

export default function AlertsPage() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.alert.loading);
  const pageData = useAppSelector((s) => s.alert.pageData);
  const marking = useAppSelector((s) => s.alert.marking);

  const [status, setStatus] = useState<AlertStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const size = 10;

  const load = async (p = page) => {
    const res = await dispatch(fetchAlertsThunk({ status: status === "ALL" ? undefined : status, page: p, size }));
    if (fetchAlertsThunk.rejected.match(res)) {
      await swal.error("Hata", res.payload ?? "Bildirimler yüklenemedi");
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const markRead = async (id: number) => {
    const ok = await swal.confirm("Okundu İşaretle", "Bu bildirimi okundu olarak işaretlemek istiyor musun?");
    if (!ok) return;

    const res = await dispatch(markAlertReadThunk(id));
    if (markAlertReadThunk.fulfilled.match(res)) {
      await swal.success("Güncellendi");
      await load(page);
    } else {
      await swal.error("Hata", res.payload ?? "Okundu olarak işaretlenemedi");
    }
  };

  const totalPages = pageData?.totalPages ?? 0;

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={900}>
          Bildirim Arşivi
        </Typography>

        <SectionCard
          title="Filtreler"
          actions={<LoadingButton loading={loading} label="Yenile" variant="outlined" onClick={() => load(page)} />}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField
              select
              label="Durum"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(0);
              }}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="ALL">Hepsi</MenuItem>
              <MenuItem value="ACTIVE">Aktif</MenuItem>
              <MenuItem value="READ">Okundu</MenuItem>
            </TextField>

            <Chip label={`Toplam: ${pageData?.totalElements ?? "-"}`} />
            <Chip label={`Sayfa: ${(pageData?.page ?? 0) + 1}/${totalPages || "-"}`} />
          </Stack>
        </SectionCard>

        <SectionCard title="Bildirimler">
          <List>
            {(pageData?.items ?? []).map((a, idx) => (
              <Box key={a.id}>
                <ListItem
                  secondaryAction={
                    <LoadingButton
                      loading={!!marking[a.id]}
                      label="Okundu"
                      variant="outlined"
                      disabled={a.status === "READ"}
                      onClick={() => markRead(a.id)}
                    />
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={statusLabel(a.status)} />
                        <Chip size="small" label={alertTypeLabel(a.type)} />
                        <Typography variant="body1" fontWeight={700}>
                          {a.message}
                        </Typography>
                      </Stack>
                    }
                    secondary={`Tarih: ${a.createdAt}`}
                  />
                </ListItem>

                {idx < (pageData?.items.length ?? 0) - 1 ? <Divider /> : null}
              </Box>
            ))}

            {(pageData?.items?.length ?? 0) === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.7, p: 2 }}>
                Bildirim yok.
              </Typography>
            ) : null}
          </List>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.max(totalPages, 1)}
              page={page + 1}
              onChange={(_, val) => {
                const newPage = val - 1;
                setPage(newPage);
                load(newPage);
              }}
            />
          </Box>
        </SectionCard>
      </Stack>
    </PageContainer>
  );
}
