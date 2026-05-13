import api from "./api";

export const downloadTemplate = async () => {
  const response = await api.get("/product-import/template", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "product_template.xlsx");
  document.body.appendChild(link);
  link.click();
};

// TEMPLATE UPDATE (baru)
export const downloadUpdateTemplate = async (categoryCodes?: string[], onlyWithSku: boolean = true) => {
  const params = new URLSearchParams();
  
  if (categoryCodes && categoryCodes.length > 0) {
    params.append("category_code", categoryCodes.join(","));
  }
  
  params.append("only_with_sku", String(onlyWithSku));

  const response = await api.get(`/product-import/template-update?${params.toString()}`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "product_update_template.xlsx");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link); 
};

export const uploadMassProduct = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/product-import/upload", formData);
};

export const updateMassProduct = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/product-import/update", formData);
};

export const listenImportProgress = (onMessage: (msg: string) => void) => {

  const eventSource = new EventSource(
    `${import.meta.env.VITE_API_BASE}/api/v1/product-import/progress`
  );

  eventSource.onmessage = (event) => {
    onMessage(event.data);
  };

  eventSource.onerror = () => {
    eventSource.close();
  };

  return eventSource;
};