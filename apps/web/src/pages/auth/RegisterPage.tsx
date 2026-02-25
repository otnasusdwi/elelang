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

const schema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Minimal 6 karakter"),
    password_confirmation: z.string().min(6, "Minimal 6 karakter"),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Konfirmasi password tidak sama",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { register: doRegister } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", password_confirmation: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await doRegister(values);
      enqueueSnackbar("Registrasi berhasil", { variant: "success" });
      nav("/", { replace: true });
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message ?? "Registrasi gagal", { variant: "error" });
    }
  };

  return (
    <AuthLayout title="Daftar" subtitle="Buat akun baru untuk mulai menggunakan aplikasi">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.2}>
          <TextField
            label="Nama"
            {...register("name")}
            error={!!formState.errors.name}
            helperText={formState.errors.name?.message}
          />
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
          <TextField
            label="Konfirmasi Password"
            type={show ? "text" : "password"}
            {...register("password_confirmation")}
            error={!!formState.errors.password_confirmation}
            helperText={formState.errors.password_confirmation?.message}
          />

          <Button type="submit" variant="contained" size="large" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Memproses..." : "Buat Akun"}
          </Button>

          <Link href="/login" underline="hover" sx={{ textAlign: "center" }}>
            Sudah punya akun? Masuk
          </Link>
        </Stack>
      </form>
    </AuthLayout>
  );
}
