import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().nonempty("username harus diisi"),
  password: z.string().nonempty("password harus diisi"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

const userRole = ["LOCKET", "ADMIN", "SUPER_ADMIN"];

export const userSchema = z.object({
  id: z.uuid().optional(),
  username: z
    .string()
    .min(6, "username minimal 6 karakter")
    .max(100, "username maksimal 100 karakter")
    .nonempty(),
  password: z
    .string()
    .min(6, "password minimal 6 karakter")
    .max(100, "password maksimal 100 karakter"),
  role: z.enum(userRole),
  fullname: z.string().nonempty(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
