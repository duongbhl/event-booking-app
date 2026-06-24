"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPayments = void 0;
const payment_model_1 = __importDefault(require("../models/payment.model"));
const listPayments = async (req, res) => {
    const payments = await payment_model_1.default.find({ user: req.user._id }).sort('-createdAt');
    res.json(payments);
};
exports.listPayments = listPayments;
