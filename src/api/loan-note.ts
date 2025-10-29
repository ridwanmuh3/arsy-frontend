import axios from "axios";
import { axiosInstance } from ".";
import type { LoanNoteSchema } from "../schemas/loan-note";

export const createLoanNote = async (loanNote: LoanNoteSchema) => {
  try {
    const response = await axiosInstance.post("/loan-notes", loanNote);

    return response.data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const message = e.response?.data?.message || e.message;
      throw new Error(message);
    }
    throw e;
  }
};

export const updateLoanNote = async (loanNote: LoanNoteSchema) => {
  try {
    const response = await axiosInstance.put("/loan-notes", loanNote);

    return response.data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const message = e.response?.data?.message || e.message;
      throw new Error(message);
    }
    throw e;
  }
};

export const findAllLoanNotes = async (
  offset: number = 0,
  limit: number = -1
) => {
  try {
    const response = await axiosInstance.get("/loan-notes", {
      params: {
        offset,
        limit,
      },
    });

    return response.data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const message = e.response?.data?.message || e.message;
      throw new Error(message);
    }
    throw e;
  }
};
