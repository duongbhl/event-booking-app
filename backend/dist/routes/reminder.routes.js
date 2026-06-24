"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const reminder_controller_1 = require("../controllers/reminder.controller");
exports.reminderRoutes = (0, express_1.Router)();
exports.reminderRoutes.get('/me', auth_middleware_1.protect, reminder_controller_1.listReminders);
exports.reminderRoutes.post('/', auth_middleware_1.protect, reminder_controller_1.createReminder);
