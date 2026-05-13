import api from "./api";

export type PricelistType = "laptop" | "komponen";

export interface Pricelist {
  id: string;
  type: PricelistType;
  file_path: string;
  created_at: string;
  updated_at: string;
}

// GET all
export const getPricelists = async (): Promise<Pricelist[]> => {
  const response = await api.get("/pricelist");
  return response.data;
};

// GET by type
export const getPricelistByType = async (
  type: PricelistType
): Promise<Pricelist> => {
  const response = await api.get(`/pricelist/${type}`);
  return response.data;
};

// Upload PDF
export const uploadPricelist = async (
  type: PricelistType,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(`/pricelist/upload/${type}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};