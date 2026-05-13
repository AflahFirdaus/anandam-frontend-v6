const BASE_URL = `${import.meta.env.VITE_API_BASE}/api/v1/banner-image`;

export interface Banner {
  id: string;
  title?: string;
  slot?: string;
  promo?: string; // Tambahkan ini
  image_url: string;
  categories?: { id: string; name: string }[]; // Tambahkan ini
  brands?: { id: string; name: string }[];     // Tambahkan ini
  created_at: string;
  updated_at: string;
}

export const getBanners = async (): Promise<Banner[]> => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Gagal fetch banner");
  // Log sudah dihapus dari sini
  return res.json();
};

export const uploadBanner = async (
  file: File,
  slot: string,
  categoryIds: string[], // Tambahkan
  brandIds: string[],    // Tambahkan
  promo: string          // Tambahkan
): Promise<Banner> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("slot", slot);
  formData.append("promo", promo);
  
  // Kirim array ID
  categoryIds.forEach(id => formData.append("categoryIds", id));
  brandIds.forEach(id => formData.append("brandIds", id));

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Gagal upload banner");
  return res.json();
};

export const updateBanner = async (
  id: string,
  file: File
): Promise<Banner> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) throw new Error("Gagal update banner");
  return res.json();
};

export const deleteBanner = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Gagal delete banner");
};

export const updateBannerTitle = async (
  id: string,
  title: string
) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE}/api/v1/banner-image/${id}/title`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }
  );

  if (!res.ok) {
    throw new Error("Gagal update title");
  }

  return res.json();
};

export const updateBannerSlot = async (id: string, slot: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/banner-image/${id}/slot`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slot }),
  });

  if (!res.ok) throw new Error("Gagal update slot");
  return res.json();
};

export const updateBannerMetadata = async (
  id: string,
  payload: { slot: string; promo: string; categoryIds: string[]; brandIds: string[] }
) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/banner-image/${id}/metadata`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal update metadata");
  return res.json();
};