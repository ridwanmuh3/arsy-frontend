import axios from "axios";
import { axiosInstance } from "./index";
import type { LoginSchema } from "../schemas/user";

export const loginUser = async (user: LoginSchema) => {
  try {
    const response = await axiosInstance.post("/auth/login", user);

    return response.data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const message = e.response?.data?.message || e.message;
      throw new Error(message);
    }

    throw e;
  }
};
