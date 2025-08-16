import type { AxiosError } from "axios";
import { axiosInstance } from ".";
import type { SearchDocumentSchema } from "../schemas/search-document";

export const createSearchDocumentRequest = async (
  searchDocument: SearchDocumentSchema,
) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.post("/search-documents", searchDocument, {
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

export const updateStatusSearchDocumentRequest = async (
  searchDocument: SearchDocumentSchema,
) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.put(
      `/search-documents/${searchDocument.id}`,
      searchDocument,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return data;
  } catch (e: unknown) {
    const err = e as AxiosError;
    return err;
  }
};

export const findAllSearchDocumentsRequest = async (
  offset: number = 0,
  limit: number = 20,
) => {
  try {
    const {
      data: { data },
    } = await axiosInstance.get(
      `/search-documents?offset=${offset}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return data;
  } catch (e: unknown) {
    const err = e as AxiosError;
    return err;
  }
};
