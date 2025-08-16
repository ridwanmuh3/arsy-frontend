import type { AxiosError } from "axios";
import { axiosInstance } from "./index";
import type { LoginSchema } from "../schemas/user";

// TODO: Perbaiki logic pemanggilan API
export const loginUser = async (user: LoginSchema) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.post("/auth/login", user, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data;
  } catch (e: unknown) {
    const err = e as AxiosError;
    return err;
  }
};
