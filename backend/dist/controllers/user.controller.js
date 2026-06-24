"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationPreference = exports.registerPushToken = exports.updateProfile = exports.getMyProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const getMyProfile = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.user._id).select('-password');
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};
exports.getMyProfile = getMyProfile;
const updateProfile = async (req, res) => {
    const { name, avatar, country, interests, location, description } = req.body;
    const user = await user_model_1.default.findByIdAndUpdate(req.user._id, { name, avatar, country, interests, location, description }, { new: true });
    res.json(user);
};
exports.updateProfile = updateProfile;
const registerPushToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Push token is required' });
        }
        if (!req.user?.notificationsEnabled) {
            return res.status(400).json({ message: 'Notifications are disabled for this user' });
        }
        const user = await user_model_1.default.findByIdAndUpdate(req.user._id, { expoPushToken: token }, { new: true });
        res.json({ success: true, message: 'Push token registered', user });
    }
    catch (error) {
        console.error('Register push token error:', error);
        res.status(500).json({ message: 'Failed to register push token' });
    }
};
exports.registerPushToken = registerPushToken;
const updateNotificationPreference = async (req, res) => {
    try {
        const { notificationsEnabled } = req.body;
        if (typeof notificationsEnabled !== 'boolean') {
            return res.status(400).json({ message: 'notificationsEnabled must be a boolean' });
        }
        const updatePayload = {
            notificationsEnabled,
        };
        if (!notificationsEnabled) {
            updatePayload.expoPushToken = null;
        }
        const user = await user_model_1.default.findByIdAndUpdate(req.user._id, updatePayload, { new: true }).select('-password');
        res.json(user);
    }
    catch (error) {
        console.error('Update notification preference error:', error);
        res.status(500).json({ message: 'Failed to update notification preference' });
    }
};
exports.updateNotificationPreference = updateNotificationPreference;
