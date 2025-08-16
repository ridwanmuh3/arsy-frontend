import type { AxiosError } from "axios";
import { axiosInstance } from ".";
import type { LoanNoteSchema } from "../schemas/loan-note";

export const createLoanNote = async (loanNote: LoanNoteSchema) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.post("/loan-notes", loanNote, {
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

export const updateLoanNote = async (loanNote: LoanNoteSchema) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.put("/loan-notes", loanNote, {
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

export const findAllLoanNotes = async (
  offset: number = 0,
  limit: number = 20,
) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.get(`/loan-notes?offset=${offset}&limit=${limit}`, {
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
