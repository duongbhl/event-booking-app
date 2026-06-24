"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const card_controller_1 = require("../controllers/card.controller");
exports.cardRoutes = (0, express_1.Router)();
exports.cardRoutes.post("/", auth_middleware_1.protect, card_controller_1.addCard);
exports.cardRoutes.get("/", auth_middleware_1.protect, card_controller_1.getMyCards);
