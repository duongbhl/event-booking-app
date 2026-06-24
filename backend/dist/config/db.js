"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("./env");
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.DB_URI);
        console.log("CONNECTION SUCCESFULLY");
    }
    catch (error) {
        console.log("CONNECTION FAILED", error);
        throw error;
    }
};
exports.connectDB = connectDB;
