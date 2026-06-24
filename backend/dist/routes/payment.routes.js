"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
exports.paymentRoutes = (0, express_1.Router)();
exports.paymentRoutes.get('/me', auth_middleware_1.protect, payment_controller_1.listPayments);
