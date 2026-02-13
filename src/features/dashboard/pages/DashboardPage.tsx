import { Stack, Typography, TextField, Box, Chip, Divider } from "@mui/material";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { SectionCard } from "../../../shared/ui/SectionCard";
import { LoadingButton } from "../../../shared/ui/LoadingButton";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchMe } from "../../user/userThunks";
import { getActiveBudgetThunk } from "../../budget/budgetThunks";
import { fetchExpenseTotalThunk } from "../../expense/expenseThunks";
import { fetchAlertsThunk } from "../../alert/alertThunks";
import { currentMonth, currentYear, monthEndISO, monthStartISO } from "../../../utils/dates";
import { useEffect, useState } from "react";
import { swal } from "../../../utils/swal";

const budgetPeriodLabel = () => "Aylık (Bu Ay)";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const me = useAppSelector((s) => s.user.me);
  const activeBudget = useAppSelector((s) => s.budget.active);
  const total = useAppSelector((s) => s.expense.total);
  const alerts = useAppSelector((s) => s.alert.pageData?.items ?? []);

  const [start, setStart] = useState(monthStartISO());
  const [end, setEnd] = useState(monthEndISO());

  const loadAll = async () => {
    const res1 = await dispatch(fetchMe());
    const res2 = await dispatch(
      getActiveBudgetThunk({ periodType: "MONTHLY", year: currentYear(), month: currentMonth() })
    );
    const res3 = await dispatch(fetchExpenseTotalThunk({ start, end }));
    const res4 = await dispatch(fetchAlertsThunk({ status: "ACTIVE", page: 0, size: 5 }));

    if (
      fetchMe.rejected.match(res1) ||
      getActiveBudgetThunk.rejected.match(res2) ||
      fetchExpenseTotalThunk.rejected.match(res3) ||
      fetchAlertsThunk.rejected.match(res4)
    ) {
      await swal.error("Yükleme Sorunu", "Bazı veriler yüklenemedi. Backend ve tokenları kontrol et.");
      return;
    }

    await swal.success("Veriler yenilendi");
  };

  useEffect(() => {
    // ilk render: success popup spam yok
    (async () => {
      await dispatch(fetchMe());
      await dispatch(getActiveBudgetThunk({ periodType: "MONTHLY", year: currentYear(), month: currentMonth() }));
      await dispatch(fetchExpenseTotalThunk({ start, end }));
      await dispatch(fetchAlertsThunk({ status: "ACTIVE", page: 0, size: 5 }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadTotals = async () => {
    const res = await dispatch(fetchExpenseTotalThunk({ start, end }));
    if (fetchExpenseTotalThunk.fulfilled.match(res)) {
      await swal.success("Toplam güncellendi");
    } else {
      await swal.error("Hata", res.payload ?? "Toplam getirilemedi");
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <Typography variant="h5" fontWeight={900} sx={{ flexGrow: 1 }}>
            Gösterge Paneli
          </Typography>
          <LoadingButton loading={false} label="Verileri Yenile" variant="outlined" onClick={loadAll} />
        </Stack>

        {/* GRID yerine CSS GRID */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          <SectionCard title="Kullanıcı Bilgileri">
            <Stack spacing={1}>
              <Typography variant="body1">
                <b>Ad Soyad:</b> {me?.fullName ?? "-"}
              </Typography>
              <Typography variant="body1">
                <b>Email:</b> {me?.email ?? "-"}
              </Typography>
            </Stack>
          </SectionCard>

          <SectionCard title={`Aktif Bütçe (${budgetPeriodLabel()})`}>
            {activeBudget ? (
              <Stack spacing={1}>
                <Typography variant="body1">
                  <b>Dönem:</b> {activeBudget.year}
                  {activeBudget.periodType === "MONTHLY" ? `-${String(activeBudget.month).padStart(2, "0")}` : ""}
                </Typography>
                <Typography variant="body1">
                  <b>Limit:</b> {activeBudget.limitAmount}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Bu dönem için aktif bütçe bulunamadı.
              </Typography>
            )}
          </SectionCard>

          <SectionCard
            title="Toplam Harcama (Tarih Aralığı)"
            actions={<LoadingButton loading={false} label="Toplamı Güncelle" variant="outlined" onClick={reloadTotals} />}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <TextField label="Başlangıç" value={start} onChange={(e) => setStart(e.target.value)} />
                <TextField label="Bitiş" value={end} onChange={(e) => setEnd(e.target.value)} />
              </Box>
              <Chip label={`Toplam: ${total?.total ?? "-"}`} sx={{ width: "fit-content" }} />
            </Stack>
          </SectionCard>

          <SectionCard title="Son Aktif Bildirimler">
            <Stack spacing={1}>
              {alerts.length === 0 ? (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Aktif bildirim yok.
                </Typography>
              ) : (
                alerts.map((a, i) => (
                  <Box key={a.id}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip size="small" label={a.type} />
                      <Typography variant="body2" fontWeight={700}>
                        {a.message}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {a.createdAt}
                    </Typography>
                    {i < alerts.length - 1 ? <Divider sx={{ my: 1 }} /> : null}
                  </Box>
                ))
              )}
            </Stack>
          </SectionCard>
        </Box>
      </Stack>
    </PageContainer>
  );
}
