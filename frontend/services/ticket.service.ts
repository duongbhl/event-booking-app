// src/services/ticket.service.ts
import api from "./api";
import { authHeader } from "./auHeader";


export const bookTicket = async (
  data: {
    eventId: string;
    ticketType: "VIP" | "Economy";
    quantity: number;
    price: number;
    method?: "wallet" | "paypal" | "credit";
  },
  token: string
) => {
  const res = await api.post(
    "/tickets/book",
    data,
    authHeader(token)
  );
  return res.data; // { tickets, payment }
};

/**
 * Confirm payment
 */
export const confirmPayment = async (
  data: {
    paymentId: string;
    success?: boolean;
  },
  token: string
) => {
  const res = await api.post("/tickets/confirm", data, authHeader(token));
  return res.data; // { payment, ticket }
};

/**
 * Get my tickets
 */
export const getMyTickets = async (token: string) => {
  const res = await api.get("/tickets/me", authHeader(token));
  return res.data; // Ticket[]
};
