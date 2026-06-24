"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const review_controller_1 = require("../controllers/review.controller");
exports.reviewRoutes = (0, express_1.Router)();
exports.reviewRoutes.get('/:eventId', review_controller_1.listReviews);
exports.reviewRoutes.post('/:eventId', auth_middleware_1.protect, review_controller_1.addReview);
