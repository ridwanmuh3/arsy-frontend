import type { AxiosError } from "axios";
import { axiosInstance } from "./index";
import type { UserSchema } from "../schemas/user";

// TODO: Perbaiki logic pemanggilan API
export const registerUser = async (user: UserSchema) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.post("/users", user, {
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

// TODO: Perbaiki logic pemanggilan API
export const updateUser = async (user: UserSchema) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.put(`/users/${user.id}`, user, {
      method: "PUT",
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

// TODO: Perbaiki logic pemanggilan API
export const deleteUser = async (userID: string) => {
  try {
    const { data: data } = await axiosInstance.delete(`/users/${userID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data;
  } catch (e: unknown) {
    const err = e as AxiosError;
    console.error(err.toJSON);
  }
};

// TODO: Perbaiki logic pemanggilan API
export const findUserByID = async (userID: string) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.get(`/users/${userID}`, {
      method: "GET",
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

// TODO: Perbaiki logic pemanggilan API
export const findAllUsers = async (offset: number = 0, limit: number = 20) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.get(`/users?offset=${offset}&limit=${limit}`, {
      method: "GET",
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
