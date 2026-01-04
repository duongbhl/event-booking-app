// src/services/auth.service.ts
import api from "./api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  avatar?: string;
  country?: string;
  interests?: string[];
  location?: string;
  description?: string;
}

export const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};



export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  avatar?: string;
  country?: string;
  interests?: string[];
  location?: string;
  description?: string;
}

export const login = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};


