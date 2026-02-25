import React, { useState } from "react";
import { Button, IconButton, InputAdornment, Link, Stack, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      enqueueSnackbar("Login berhasil", { variant: "success" });
      nav("/", { replace: true });
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Login gagal", { variant: "error" });
    }
  };

  return (
    <AuthLayout title="Masuk" subtitle="Gunakan akun Anda untuk melanjutkan">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.2}>
          <TextField
            label="Email"
            type="email"
            {...register("email")}
            error={!!formState.errors.email}
            helperText={formState.errors.email?.message}
          />
          <TextField
            label="Password"
            type={show ? "text" : "password"}
            {...register("password")}
            error={!!formState.errors.password}
            helperText={formState.errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShow((s) => !s)} edge="end">
                    {show ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? "Memproses..." : "Masuk"}
          </Button>

          <Link href="/register" underline="hover" sx={{ textAlign: "center" }}>
            Belum punya akun? Daftar
          </Link>
        </Stack>
      </form>
    </AuthLayout>
  );
}
