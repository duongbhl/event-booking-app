// src/services/payment.service.ts
import api from "./api";
import { authHeader } from "./auHeader";


/**
 * Get my payment history
 */
export const getMyPayments = async (token: string) => {
  const res = await api.get("/payments/me", authHeader(token));
  return res.data;
};
