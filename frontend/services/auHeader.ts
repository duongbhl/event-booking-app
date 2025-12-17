// src/services/authHeader.ts
export const authHeader = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
