import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/user.model';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from '../utils/generateToken';
import { sendEmail } from '../utils/sendEmail';

const authResponse = (user: any) => ({
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
    token: generateToken(String(user._id)),
});

export const register = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already used' });
    const user = await User.create({ name, email, password });
    return res.status(201).json(authResponse(user));
};


export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    res.json(authResponse(user));
};

export const me = async (req: any, res: Response) => {
    res.json(req.user);
};

const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashResetCode = (code: string) => crypto.createHash("sha256").update(code).digest("hex");

export const forgotPassword = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body as { email: string };
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetCode +passwordResetExpires');

    if (!user) return res.json({ message: 'If the email exists, a reset code has been sent' });

    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetCode = hashResetCode(resetCode);
    user.passwordResetExpires = expiresAt;
    await user.save();

    try {
        await sendEmail({
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
    } catch (error: any) {
        if (error?.message === 'Missing email credentials') {
            return res.status(500).json({ message: 'Email service is not configured' });
        }

        console.error('Forgot password email error:', error);
        return res.status(500).json({ message: 'Failed to send reset email' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
        email,
        code,
        newPassword,
    } = req.body as {
        email: string;
        code: string;
        newPassword: string;
    };

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password +passwordResetCode +passwordResetExpires');

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
