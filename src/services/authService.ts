import api from "./api";

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string; 
  expires_in: number;
  user: {
    id: string;
    username: string;
  };
}

export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  const result = response.data;

  // Simpan keduanya
  localStorage.setItem("token", result.access_token);
  localStorage.setItem("refresh_token", result.refresh_token); 
  localStorage.setItem("user", JSON.stringify(result.user));

  return result;
};