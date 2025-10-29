import axios from "axios";
import { axiosInstance } from ".";
import type { SearchDocumentSchema } from "../schemas/search-document";

export const createSearchDocumentRequest = async (
  searchDocument: SearchDocumentSchema
) => {
  try {
    const response = await axiosInstance.post(
      "/search-documents",
      searchDocument
    );

    return response.data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const message = e.response?.data?.message || e.message;
      throw new Error(message);
    }
    throw e;
  }
};

export const updateStatusSearchDocumentRequest = async (
  searchDocument: SearchDocumentSchema
) => {
  try {
    const response = await axiosInstance.put(
      `/search-documents/${searchDocument.id}`,
      searchDocument
    );

    return response.data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const message = e.response?.data?.message || e.message;
      throw new Error(message);
    }
    throw e;
  }
};

export const findAllSearchDocumentsRequest = async (
  offset: number = 0,
  limit: number = -1
) => {
  try {
    const response = await axiosInstance.get("/search-documents", {
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
