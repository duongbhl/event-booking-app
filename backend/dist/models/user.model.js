"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const schema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: String,
    country: String,
    interests: [{ type: String }],
    location: String,
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    phone: String,
    description: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    verified: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
    expoPushToken: { type: String, default: null },
    passwordResetCode: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
}, { timestamps: true });
schema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
schema.methods.matchPassword = async function (entered) {
    return bcryptjs_1.default.compare(entered, this.password);
};
const User = mongoose_1.default.model('User', schema);
exports.default = User;
