import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { addCard, getMyCards } from "../controllers/card.controller";

export const cardRoutes = Router();

cardRoutes.post("/", protect, addCard);
cardRoutes.get("/", protect, getMyCards);
