"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCards = exports.addCard = void 0;
const card_model_1 = __importDefault(require("../models/card.model"));
const addCard = async (req, res) => {
    const { cardNumber, expMonth, expYear, isPrimary } = req.body;
    if (!cardNumber || !expMonth || !expYear) {
        return res.status(400).json({ message: "Missing card data" });
    }
    const last4 = cardNumber.slice(-4);
    const brand = cardNumber.startsWith("4") ? "Visa" : "Mastercard";
    if (isPrimary) {
        await card_model_1.default.updateMany({ user: req.user._id }, { isPrimary: false });
    }
    const card = await card_model_1.default.create({
        user: req.user._id,
        brand,
        last4,
        expMonth,
        expYear,
        isPrimary: !!isPrimary,
    });
    res.status(201).json(card);
};
exports.addCard = addCard;
const getMyCards = async (req, res) => {
    const cards = await card_model_1.default.find({ user: req.user._id }).sort("-createdAt");
    res.json(cards);
};
exports.getMyCards = getMyCards;
