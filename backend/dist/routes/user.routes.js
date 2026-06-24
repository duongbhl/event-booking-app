"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
exports.userRoutes = (0, express_1.Router)();
// Test endpoint
exports.userRoutes.get('/test', (req, res) => {
    res.json({ message: "User routes working" });
});
exports.userRoutes.get('/me', auth_middleware_1.protect, user_controller_1.getMyProfile);
exports.userRoutes.put('/me', auth_middleware_1.protect, user_controller_1.updateProfile);
exports.userRoutes.post('/push-token', auth_middleware_1.protect, user_controller_1.registerPushToken);
exports.userRoutes.put('/notification-preference', auth_middleware_1.protect, user_controller_1.updateNotificationPreference);
