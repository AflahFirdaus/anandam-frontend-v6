export const getThumbnailUrl = (url?: string) => {
  if (!url) return "";

  if (url.startsWith("http")) return url;

  return `${import.meta.env.VITE_API_BASE}${url}`;
};

export const getOriginalUrl = (url?: string) => {
  if (!url) return "";

  if (url.startsWith("http")) return url;

  return `${import.meta.env.VITE_API_BASE}${url}`;
};