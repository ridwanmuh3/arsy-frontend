import { axiosInstance, getApiErrorMessage } from ".";
import type { DocumentSchema } from "../schemas/document";

export const addDocument = async (document: DocumentSchema) => {
  try {
    const response = await axiosInstance.post("/documents", document);

    return response.data.data;
  } catch (e: unknown) {
    throw new Error(getApiErrorMessage(e));
  }
};

export const findAllDocuments = async (
  offset: number = 0,
  limit: number = -1
) => {
  try {
    const response = await axiosInstance.get("/documents", {
      params: {
        offset,
        limit,
      },
    });

    return response.data.data;
  } catch (e: unknown) {
    throw new Error(getApiErrorMessage(e));
  }
};
