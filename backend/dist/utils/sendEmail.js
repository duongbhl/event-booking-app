"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const getEmailConfig = () => {
    const user = (process.env.EMAIL_USER ||
        process.env.EMAIL_ADDRESS ||
        process.env.SMTP_USER ||
        process.env.GMAIL_USER)?.trim();
    const pass = (process.env.EMAIL_PASSWORD ||
        process.env.EMAIL_PASS ||
        process.env.EMAIL_APP_PASSWORD ||
        process.env.SMTP_PASS ||
        process.env.GMAIL_PASS)?.trim();
    const from = (process.env.EMAIL_FROM || `Event Booking <${user}>`)?.trim();
    return { user, pass, from };
};
const sendEmail = async ({ to, subject, text, html, }) => {
    const { user, pass, from } = getEmailConfig();
    if (!user || !pass || !from) {
        throw new Error('Missing email credentials');
    }
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
    await transporter.sendMail({
        from,
        to: to.trim().toLowerCase(),
        subject,
        text,
        html,
    });
};
exports.sendEmail = sendEmail;
