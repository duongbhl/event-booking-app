"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReminders = exports.createReminder = void 0;
const reminder_model_1 = __importDefault(require("../models/reminder.model"));
const createReminder = async (req, res) => {
    const { eventId, remindAt } = req.body;
    const reminder = await reminder_model_1.default.create({ user: req.user._id, event: eventId, remindAt });
    res.status(201).json(reminder);
};
exports.createReminder = createReminder;
const listReminders = async (req, res) => {
    const items = await reminder_model_1.default.find({ user: req.user._id }).sort('remindAt');
    res.json(items);
};
exports.listReminders = listReminders;
