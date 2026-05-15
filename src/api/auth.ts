import { axiosInstance, getApiErrorMessage } from "./index";
import type { LoginSchema } from "../schemas/user";

export const loginUser = async (user: LoginSchema) => {
  try {
    const response = await axiosInstance.post("/auth/login", user);

    return response.data.data;
  } catch (e: unknown) {
    throw new Error(getApiErrorMessage(e));
  }
};
