const BASE_URL = `${import.meta.env.VITE_API_BASE}/api/v1/certificates`;

export interface Certificate {
  id: string;
  name: string;
  school: string;
  start_date: string;
  end_date: string;
  certificate_number: string;
  pdf_url: string;
  status: "lulus" | "gagal" | "lainnya";
  reason?: string;
  created_at: string;
}

export const getCertificates = async (): Promise<Certificate[]> => {
  const res = await fetch(BASE_URL);

  if (!res.ok) throw new Error("Gagal fetch certificates");

  return res.json();
};

export const createCertificate = async (data: {
  name: string;
  school: string;
  start_date: string;
  end_date: string;
  status: "lulus" | "gagal" | "lainnya";
  reason?: string;
}): Promise<Certificate> => {

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  if (!res.ok) {
    console.log("API ERROR:", response);
    throw new Error(response.message || "Gagal generate certificate");
  }

  return response;
};

export const getCertificateById = async (id: string): Promise<Certificate> => {

  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok) throw new Error("Certificate tidak ditemukan");

  return res.json();

};