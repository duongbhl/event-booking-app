"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("../config/env");
const user_model_1 = __importDefault(require("../models/user.model"));
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log("🔒 PROTECT MIDDLEWARE - Auth Header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No Bearer token");
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        const user = await user_model_1.default.findById(decoded.id).select("-password");
        if (!user) {
            console.log("❌ User not found");
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user; // ✅ QUAN TRỌNG
        next();
    }
    catch (error) {
        console.log("❌ Token error:", error);
        return res.status(401).json({ message: "Token invalid" });
    }
};
exports.protect = protect;
const authorize = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};
exports.authorize = authorize;
const errorHandler = (err, _req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
exports.errorHandler = errorHandler;
