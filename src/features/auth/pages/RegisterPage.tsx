import { Box, Card, CardContent, Typography, TextField, Stack, Link } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "../../../shared/ui/LoadingButton";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { registerThunk } from "../authThunks";
import { swal } from "../../../utils/swal";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { fetchMe } from "../../user/userThunks";

const schema = z.object({
  fullName: z.string().min(2, "En az 2 karakter"),
  email: z.string().email("Geçersiz email"),
  password: z.string().min(6, "En az 6 karakter"),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const authLoading = useAppSelector((s) => s.auth.loading);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) as any });

  const onSubmit = async (v: FormValues) => {
    const res = await dispatch(registerThunk(v));
    if (registerThunk.fulfilled.match(res)) {
      await dispatch(fetchMe());
      await swal.success("Kayıt başarılı");
      navigate("/dashboard", { replace: true });
      return;
    }

    const msg = res.payload ?? "Kayıt başarısız";
    await swal.error("Kayıt başarısız", msg);

    // basit alan yönlendirme
    if (typeof msg === "string") {
      const m = msg.toLowerCase();
      if (m.includes("email")) setError("email", { message: msg });
      if (m.includes("password") || m.includes("şifre")) setError("password", { message: msg });
    }
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background: (t) =>
          t.palette.mode === "dark"
            ? "radial-gradient(1200px 600px at 20% 10%, rgba(25,118,210,0.35), transparent 60%), radial-gradient(800px 500px at 90% 40%, rgba(156,39,176,0.25), transparent 55%), #0b1220"
            : "radial-gradient(1200px 600px at 20% 10%, rgba(25,118,210,0.20), transparent 60%), radial-gradient(800px 500px at 90% 40%, rgba(156,39,176,0.12), transparent 55%), #f6f8fc",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 520 }} variant="outlined">
        <CardContent>
          <Typography variant="h4" fontWeight={900} mb={0.5}>
            BudgetApp
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }} mb={3}>
            Bütçeni takip et. Harcamalarını kontrol altında tut.
          </Typography>

          <Typography variant="h6" fontWeight={800} mb={1}>
            Kayıt Ol
          </Typography>

          <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Ad Soyad"
              fullWidth
              {...register("fullName")}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />
            <TextField
              label="Email"
              fullWidth
              autoComplete="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Şifre"
              type="password"
              fullWidth
              autoComplete="new-password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <LoadingButton loading={authLoading} label="Hesap Oluştur" type="submit" />

            <Typography variant="body2">
              Zaten hesabın var mı?{" "}
              <Link component={RouterLink} to="/login">
                Giriş Yap
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
