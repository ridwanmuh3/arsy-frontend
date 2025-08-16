import type { AxiosError } from "axios";
import { axiosInstance } from ".";
import type { DocumentSchema } from "../schemas/document";

export const addDocument = async (document: DocumentSchema) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.post("/documents", document, {
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

export const findAllDocuments = async (
  offset: number = 0,
  limit: number = 20,
) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.get(`/documents?offset=${offset}&limit=${limit}`, {
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
