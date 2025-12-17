// src/utils/paymentMapper.ts
export const mapPaymentMethod = (
  method: string
): "credit" | "paypal" | "wallet" => {
  switch (method) {
    case "paypal":
      return "paypal";
    case "card":
      return "credit";
    default:
      return "wallet"; // apple, google
  }
};
