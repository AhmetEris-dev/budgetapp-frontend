import {
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
} from "@mui/material";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { SectionCard } from "../../../shared/ui/SectionCard";
import { LoadingButton } from "../../../shared/ui/LoadingButton";
import { monthEndISO, monthStartISO, todayISO } from "../../../utils/dates";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { createExpenseThunk, fetchExpensesThunk, fetchExpenseTotalThunk } from "../expenseThunks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { swal } from "../../../utils/swal";

const filterSchema = z.object({
  start: z.string().min(10, "Zorunlu"),
  end: z.string().min(10, "Zorunlu"),
});
type FilterForm = z.infer<typeof filterSchema>;

const createSchema = z.object({
  amount: z.string().min(1, "Zorunlu"),
  expenseDate: z.string().min(10, "Zorunlu"),
  title: z.string().min(2, "En az 2 karakter"),
  description: z.string().optional(),
  type: z.enum(["NORMAL", "REFUND", "ADJUSTMENT"]),
});
type CreateForm = z.infer<typeof createSchema>;

const typeLabel = (t: "NORMAL" | "REFUND" | "ADJUSTMENT") => {
  if (t === "NORMAL") return "Normal";
  if (t === "REFUND") return "İade";
  return "Düzeltme";
};

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.expense.items);
  const total = useAppSelector((s) => s.expense.total);
  const loadingList = useAppSelector((s) => s.expense.loadingList);
  const loadingTotal = useAppSelector((s) => s.expense.loadingTotal);
  const creating = useAppSelector((s) => s.expense.creating);

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema) as any,
    defaultValues: { start: monthStartISO(), end: monthEndISO() },
  });

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema) as any,
    defaultValues: {
      amount: "",
      expenseDate: todayISO(),
      title: "",
      description: "",
      type: "NORMAL",
    },
  });

  const load = async () => {
    const v = filterForm.getValues();
    const res1 = await dispatch(fetchExpensesThunk(v));
    const res2 = await dispatch(fetchExpenseTotalThunk(v));

    if (fetchExpensesThunk.rejected.match(res1)) {
      await swal.error("Hata", res1.payload ?? "Harcamalar getirilemedi");
      return;
    }
    if (fetchExpenseTotalThunk.rejected.match(res2)) {
      await swal.error("Hata", res2.payload ?? "Toplam getirilemedi");
      return;
    }
  };

  // sayfa açılınca otomatik listele (kullanıcıya “load” yaptırma)
  useEffect(() => {
    (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (v: CreateForm) => {
    const res = await dispatch(createExpenseThunk(v));
    if (createExpenseThunk.fulfilled.match(res)) {
      await swal.success("Harcama eklendi");
      createForm.reset({ ...createForm.getValues(), amount: "", title: "", description: "" });
      await load();
      return;
    }
    await swal.error("Hata", res.payload ?? "Harcama eklenemedi");
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={900}>
          Harcamalar
        </Typography>

        <SectionCard
          title="Filtre"
          actions={<LoadingButton loading={loadingList || loadingTotal} label="Listele" variant="outlined" onClick={load} />}
        >
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              label="Başlangıç (YYYY-AA-GG)"
              {...filterForm.register("start")}
              error={!!filterForm.formState.errors.start}
              helperText={filterForm.formState.errors.start?.message}
            />
            <TextField
              fullWidth
              label="Bitiş (YYYY-AA-GG)"
              {...filterForm.register("end")}
              error={!!filterForm.formState.errors.end}
              helperText={filterForm.formState.errors.end?.message}
            />

            <Stack direction="row" spacing={2} alignItems="center" sx={{ justifyContent: { xs: "flex-start", md: "flex-end" } }}>
              <Chip label={`Toplam: ${total?.total ?? "-"}`} />
            </Stack>
          </Box>
        </SectionCard>

        <SectionCard title="Harcama Ekle">
          <Box component="form" onSubmit={createForm.handleSubmit(onCreate)}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "2fr 3fr 3fr 4fr" },
                alignItems: "start",
              }}
            >
              <TextField
                fullWidth
                label="Tutar"
                placeholder="Örn: 120.50"
                {...createForm.register("amount")}
                error={!!createForm.formState.errors.amount}
                helperText={createForm.formState.errors.amount?.message}
              />

              <TextField
                fullWidth
                label="Tarih"
                placeholder="YYYY-AA-GG"
                {...createForm.register("expenseDate")}
                error={!!createForm.formState.errors.expenseDate}
                helperText={createForm.formState.errors.expenseDate?.message}
              />

              <TextField
                fullWidth
                label="Tür"
                select
                {...createForm.register("type")}
                error={!!createForm.formState.errors.type}
                helperText={createForm.formState.errors.type?.message}
              >
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="REFUND">İade</MenuItem>
                <MenuItem value="ADJUSTMENT">Düzeltme</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Başlık"
                {...createForm.register("title")}
                error={!!createForm.formState.errors.title}
                helperText={createForm.formState.errors.title?.message}
              />

              <Box sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}>
                <TextField
                  fullWidth
                  label="Açıklama (opsiyonel)"
                  {...createForm.register("description")}
                  error={!!createForm.formState.errors.description}
                  helperText={createForm.formState.errors.description?.message}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}>
                <LoadingButton loading={creating} label="Harcama Ekle" type="submit" />
              </Box>
            </Box>
          </Box>
        </SectionCard>

        <SectionCard title="Harcama Listesi">
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Başlık</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.expenseDate}</TableCell>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>
                      <Chip size="small" label={typeLabel(e.type)} />
                    </TableCell>
                    <TableCell align="right">{e.amount}</TableCell>
                  </TableRow>
                ))}
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ opacity: 0.7 }}>
                      Henüz harcama yok.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      </Stack>
    </PageContainer>
  );
}
