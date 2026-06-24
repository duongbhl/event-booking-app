"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const sendNotification = async (userId, { title, message, type }) => {
    console.log('Notify', userId, title, message, type);
};
exports.sendNotification = sendNotification;
