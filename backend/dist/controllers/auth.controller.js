"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.me = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const generateToken_1 = require("../utils/generateToken");
const sendEmail_1 = require("../utils/sendEmail");
const authResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    country: user.country,
    interests: user.interests,
    location: user.location,
    description: user.description,
    notificationsEnabled: user.notificationsEnabled,
    token: (0, generateToken_1.generateToken)(String(user._id)),
});
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body;
    const exists = await user_model_1.default.findOne({ email });
    if (exists)
        return res.status(400).json({ message: 'Email already used' });
    const user = await user_model_1.default.create({ name, email, password });
    return res.status(201).json(authResponse(user));
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await user_model_1.default.findOne({ email }).select('+password');
    if (!user)
        return res.status(404).json({ message: "Invalid credentials" });
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });
    res.json(authResponse(user));
};
exports.login = login;
const me = async (req, res) => {
    res.json(req.user);
};
exports.me = me;
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashResetCode = (code) => crypto_1.default.createHash("sha256").update(code).digest("hex");
const forgotPassword = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await user_model_1.default.findOne({ email: normalizedEmail }).select('+passwordResetCode +passwordResetExpires');
    if (!user)
        return res.json({ message: 'If the email exists, a reset code has been sent' });
    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetCode = hashResetCode(resetCode);
    user.passwordResetExpires = expiresAt;
    await user.save();
    try {
        await (0, sendEmail_1.sendEmail)({
            to: normalizedEmail,
            subject: 'Password reset code',
            text: `Your password reset code is ${resetCode}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
                    <h2 style="margin-bottom: 12px;">Password reset request</h2>
                    <p>Use the code below to reset your password.</p>
                    <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">
                        ${resetCode}
                    </div>
                    <p>This code expires in 10 minutes.</p>
                </div>
            `,
        });
        return res.json({ message: 'If the email exists, a reset code has been sent' });
    }
    catch (error) {
        if (error?.message === 'Missing email credentials') {
            return res.status(500).json({ message: 'Email service is not configured' });
        }
        console.error('Forgot password email error:', error);
        return res.status(500).json({ message: 'Failed to send reset email' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { email, code, newPassword, } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();
    const user = await user_model_1.default.findOne({ email: normalizedEmail }).select('+password +passwordResetCode +passwordResetExpires');
    if (!user || !user.passwordResetCode || !user.passwordResetExpires) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    if (user.passwordResetCode !== hashResetCode(normalizedCode) || user.passwordResetExpires.getTime() < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();
    return res.json({ message: 'Password has been reset successfully' });
};
exports.resetPassword = resetPassword;
