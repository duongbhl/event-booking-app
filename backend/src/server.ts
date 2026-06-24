import "./config/env";
import { createServer } from "http";
import { app } from "./app";
import { connectDB } from "./config/db"
import { startEventReminderScheduler } from "./utils/eventReminder";
import { initializeChatSocket } from "./socket";

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await connectDB();

    startEventReminderScheduler();

    const httpServer = createServer(app);
    initializeChatSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
