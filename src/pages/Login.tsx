import { Box, Button, FormControl, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useState } from "react";
import atrBpnLogo from "/icons/logo-atr-bpn.png";
import { loginSchema, type LoginSchema } from "../schemas/user";
import { useAuth } from "../hooks/auth";

const Login = () => {
  const form = useForm({ resolver: zodResolver(loginSchema) });
  const auth = useAuth();
  const [error, setError] = useState<string>("");

  const submitHandler = (data: LoginSchema) => {
    auth.login(data.username, data.password, setError);
  };

  return (
    <Fragment>
      <Box
        sx={{
          padding: { xs: "1.5rem 1.25rem", sm: "2.5rem 2.5rem" },
          width: "min(28rem, calc(100vw - 2rem))",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 1,
          borderRadius: "4px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Box>
            <img width={70} src={atrBpnLogo} alt="logo ATR/BPN" />
          </Box>
          <h2
            style={{
              fontSize: "1rem",
              lineHeight: "1.2",
              textAlign: "start",
              width: "15rem",
            }}
          >
            Kantor Pertanahan Kabupaten Pangandaran
          </h2>
        </Box>
        <Box>
          <h1 style={{ lineHeight: 1 }}>Login</h1>
          <p style={{ lineHeight: 1 }}>Selamat datang di aplikasi ArSy</p>
        </Box>
        <Box>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
            onSubmit={form.handleSubmit(submitHandler)}
            method="POST"
            autoComplete="off"
          >
            <FormControl>
              <TextField
                type="text"
                variant="outlined"
                id="username"
                label="Username"
                required
                {...form.register("username")}
                error={!!form.formState.errors.username}
                helperText={form.formState.errors.username?.message}
              />
            </FormControl>
            <FormControl>
              <TextField
                type="password"
                variant="outlined"
                id="password"
                label="Password"
                required
                {...form.register("password")}
                error={!!form.formState.errors.password}
                helperText={form.formState.errors.password?.message}
              />
            </FormControl>
            <Button type="submit" variant="contained" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Memproses..." : "Login"}
            </Button>
            {error && (
              <Typography color="error" align="center">
                {error}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
};

export default Login;
