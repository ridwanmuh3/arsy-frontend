import axios from "axios";
import { axiosInstance } from ".";
import type { UserSchema } from "../schemas/user";

const handleError = (e: unknown) => {
  if (axios.isAxiosError(e)) {
    const message = e.response?.data?.message || e.message;
    throw new Error(message);
  }
  throw e;
};

export const registerUser = async (user: UserSchema) => {
  try {
    const response = await axiosInstance.post("/users", user);
    return response.data.data;
  } catch (e: unknown) {
    handleError(e);
  }
};

export const updateUser = async (user: UserSchema) => {
  try {
    const response = await axiosInstance.put(`/users/${user.id}`, user);
    return response.data.data;
  } catch (e: unknown) {
    handleError(e);
  }
};

export const deleteUser = async (userID: string) => {
  try {
    const response = await axiosInstance.delete(`/users/${userID}`);
    return response.data;
  } catch (e: unknown) {
    handleError(e);
  }
};

export const findUserByID = async (userID: string) => {
  try {
    const response = await axiosInstance.get(`/users/${userID}`);
    return response.data.data;
  } catch (e: unknown) {
    handleError(e);
  }
};

export const findAllUsers = async (offset: number = 0, limit: number = -1) => {
  try {
    const response = await axiosInstance.get("/users", {
      params: {
        offset,
        limit,
      },
    });

    return response.data.data;
  } catch (e: unknown) {
    handleError(e);
  }
};
