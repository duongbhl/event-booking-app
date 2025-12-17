import api from "./api";
import { authHeader } from "./auHeader";


export const addCard = async (
  data: {
    cardNumber: string;
    expMonth: number;
    expYear: number;
    isPrimary: boolean;
  },
  token: string
) => {
  const res = await api.post("/cards", data, authHeader(token));
  return res.data;
};

export const getMyCards = async (token: string) => {
  const res = await api.get("/cards", authHeader(token));
  return res.data;
};
