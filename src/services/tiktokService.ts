import api from "./api";

const BASE_URL = `/tiktok`;

export const getTikTokLiveStatus = async () => {
  const res = await api.get(`${BASE_URL}/live-status`);
  return res.data;
};

export const setTikTokLiveStatus = async (is_live: boolean) => {
  const res = await api.post(`${BASE_URL}/live-toggle`, {
    is_live,
  });
  return res.data;
};