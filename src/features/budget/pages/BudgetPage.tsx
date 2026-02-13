import { Box, Stack, TextField, MenuItem, Typography } from "@mui/material";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { SectionCard } from "../../../shared/ui/SectionCard";
import { LoadingButton } from "../../../shared/ui/LoadingButton";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { upsertBudgetThunk, getActiveBudgetThunk } from "../budgetThunks";
import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { swal } from "../../../utils/swal";
import { currentMonth, currentYear } from "../../../utils/dates";

const toNumber = (v: unknown) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return v;
};

const schema = z
  .object({
    periodType: z.enum(["MONTHLY", "YEARLY"]),
    year: z.preprocess(toNumber, z.number().int().min(2000).max(2100)),
    month: z.preprocess(toNumber, z.number().int().min(1).max(12)).optional(),
    limitAmount: z.string().min(1, "Zorunlu"),
  })
  .refine((v) => (v.periodType === "MONTHLY" ? v.month != null : true), {
    path: ["month"],
    message: "Aylık bütçe için ay seçmelisin",
  });

type FormValues = z.infer<typeof schema>;

const periodLabel = (v: "MONTHLY" | "YEARLY") => (v === "MONTHLY" ? "Aylık" : "Yıllık");

export default function BudgetPage() {
  const dispatch = useAppDispatch();
  const active = useAppSelector((s) => s.budget.active);
  const loadingActive = useAppSelector((s) => s.budget.loadingActive);
  const upserting = useAppSelector((s) => s.budget.upserting);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      periodType: "MONTHLY",
      year: currentYear(),
      month: currentMonth(),
      limitAmount: "",
    },
  });

  const periodType = watch("periodType");

  // sayfa açılınca aktif bütçeyi otomatik çek (kullanıcıya "load" yaptırma)
  useEffect(() => {
    (async () => {
      const y = currentYear();
      const m = currentMonth();
      const res = await dispatch(getActiveBudgetThunk({ periodType: "MONTHLY", year: y, month: m }));
      if (getActiveBudgetThunk.fulfilled.match(res) && res.payload) {
        // formu aktif bütçeyle doldur (kullanıcı neyin aktif olduğunu anlasın)
        setValue("periodType", res.payload.periodType);
        setValue("year", res.payload.year);
        setValue("month", res.payload.periodType === "MONTHLY" ? res.payload.month : undefined);
        setValue("limitAmount", String(res.payload.limitAmount));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async (v: FormValues) => {
    const payload = {
      periodType: v.periodType,
      year: v.year,
      month: v.periodType === "MONTHLY" ? v.month : undefined,
      limitAmount: v.limitAmount,
    };

    const res = await dispatch(upsertBudgetThunk(payload));
    if (upsertBudgetThunk.fulfilled.match(res)) {
      await swal.success("Bütçe kaydedildi");
      // kaydetten sonra aktif bütçeyi de güncelle
      await dispatch(
        getActiveBudgetThunk({
          periodType: v.periodType,
          year: v.year,
          month: v.periodType === "MONTHLY" ? v.month : undefined,
        })
      );
    } else {
      await swal.error("Hata", res.payload ?? "Bütçe kaydedilemedi");
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={900}>
          Bütçe
        </Typography>

        <SectionCard title="Bütçe Ayarla">
          <Box
            component="form"
            onSubmit={handleSubmit(onSave)}
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
              alignItems: "start",
            }}
          >
            <TextField
              select
              fullWidth
              label="Bütçe Tipi"
              {...register("periodType")}
              error={!!errors.periodType}
              helperText={errors.periodType?.message}
            >
              <MenuItem value="MONTHLY">Aylık</MenuItem>
              <MenuItem value="YEARLY">Yıllık</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Yıl"
              type="number"
              {...register("year")}
              error={!!errors.year}
              helperText={errors.year?.message}
            />

            {periodType === "MONTHLY" ? (
              <TextField
                fullWidth
                label="Ay"
                type="number"
                {...register("month")}
                error={!!errors.month}
                helperText={errors.month?.message}
              />
            ) : (
              <Box />
            )}

            <TextField
              fullWidth
              label="Bütçe Limiti"
              placeholder="Örn: 15000"
              {...register("limitAmount")}
              error={!!errors.limitAmount}
              helperText={errors.limitAmount?.message}
            />

            <Box sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}>
              <LoadingButton loading={upserting || loadingActive} label="Bütçeyi Kaydet" type="submit" />
            </Box>
          </Box>
        </SectionCard>

        <SectionCard title="Aktif Bütçe">
          {active ? (
            <Stack spacing={1}>
              <Typography variant="body1">
                <b>Dönem:</b> {periodLabel(active.periodType)} {active.year}
                {active.periodType === "MONTHLY" ? `-${String(active.month).padStart(2, "0")}` : ""}
              </Typography>
              <Typography variant="body1">
                <b>Limit:</b> {active.limitAmount}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Aktif bütçe bulunamadı.
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
}
