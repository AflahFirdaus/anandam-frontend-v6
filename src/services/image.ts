const API_URL = `${import.meta.env.VITE_API_BASE}`;

export const getThumbnailUrl = (path?: string) => {
  if (!path) return "";

  const filename = path.split("/").pop();

  return `${API_URL}/uploads/products/thumbnails/${filename}`;
};