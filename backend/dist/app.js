"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const event_routes_1 = require("./routes/event.routes");
const ticket_routes_1 = require("./routes/ticket.routes");
const payment_routes_1 = require("./routes/payment.routes");
const review_routes_1 = require("./routes/review.routes");
const notification_routes_1 = require("./routes/notification.routes");
const bookmark_routes_1 = require("./routes/bookmark.routes");
const reminder_routes_1 = require("./routes/reminder.routes");
const chat_routes_1 = require("./routes/chat.routes");
const card_routes_1 = require("./routes/card.routes");
exports.app = (0, express_1.default)();
const allowedOrigins = (process.env.CORS || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
exports.app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
}));
exports.app.use((0, helmet_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.get("/api/health", (_req, res) => {
    res.status(200).json({
        ok: true,
        service: "backend",
        timestamp: new Date().toISOString(),
    });
});
//callAPI
exports.app.use('/api/auth', auth_routes_1.authRoutes);
exports.app.use('/api/users', user_routes_1.userRoutes);
exports.app.use('/api/events', event_routes_1.eventRoutes);
exports.app.use('/api/tickets', ticket_routes_1.ticketRoutes);
exports.app.use('/api/payments', payment_routes_1.paymentRoutes);
exports.app.use("/api/cards", card_routes_1.cardRoutes);
exports.app.use('/api/reviews', review_routes_1.reviewRoutes);
exports.app.use('/api/notifications', notification_routes_1.notificationRoutes);
exports.app.use('/api/bookmarks', bookmark_routes_1.bookmarkRoutes);
exports.app.use('/api/reminders', reminder_routes_1.reminderRoutes);
exports.app.use('/api/chat', chat_routes_1.chatRoutes);
exports.app.use(auth_middleware_1.errorHandler);
//call api
