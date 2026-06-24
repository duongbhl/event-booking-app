"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.authRoutes = (0, express_1.Router)();
exports.authRoutes.post('/register', [(0, express_validator_1.body)('name').notEmpty(), (0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('password').isLength({ min: 6 })], auth_controller_1.register);
exports.authRoutes.post('/login', auth_controller_1.login);
exports.authRoutes.post('/forgot-password', [(0, express_validator_1.body)('email').isEmail()], auth_controller_1.forgotPassword);
exports.authRoutes.post('/reset-password', [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('code').isLength({ min: 4, max: 6 }),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }),
], auth_controller_1.resetPassword);
exports.authRoutes.get('/me', auth_middleware_1.protect, auth_controller_1.me);
