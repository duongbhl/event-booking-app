import { Response } from "express";
import Card from "../models/card.model";

export const addCard = async (req: any, res: Response) => {
  const { cardNumber, expMonth, expYear, isPrimary } = req.body;

  if (!cardNumber || !expMonth || !expYear) {
    return res.status(400).json({ message: "Missing card data" });
  }

  const last4 = cardNumber.slice(-4);
  const brand = cardNumber.startsWith("4") ? "Visa" : "Mastercard";

  if (isPrimary) {
    await Card.updateMany(
      { user: req.user._id },
      { isPrimary: false }
    );
  }

  const card = await Card.create({
    user: req.user._id,
    brand,
    last4,
    expMonth,
    expYear,
    isPrimary: !!isPrimary,
  });

  res.status(201).json(card);
};

export const getMyCards = async (req: any, res: Response) => {
  const cards = await Card.find({ user: req.user._id }).sort("-createdAt");
  res.json(cards);
};
