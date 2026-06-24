"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env");
const http_1 = require("http");
const app_1 = require("./app");
const db_1 = require("./config/db");
const eventReminder_1 = require("./utils/eventReminder");
const socket_1 = require("./socket");
const PORT = Number(process.env.PORT || 5000);
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        (0, eventReminder_1.startEventReminderScheduler)();
        const httpServer = (0, http_1.createServer)(app_1.app);
        (0, socket_1.initializeChatSocket)(httpServer);
        httpServer.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
startServer();
