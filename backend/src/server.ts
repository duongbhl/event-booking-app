import dotenv from "dotenv";
import { createServer } from "http";
import { app } from "./app";
import { connectDB } from "./config/db"
import { startEventReminderScheduler } from "./utils/eventReminder";
import { initializeChatSocket } from "./socket";

dotenv.config();

const PORT = 5000

const test = async () =>{
    await connectDB();
    
    // Start event reminder scheduler
    startEventReminderScheduler();

    const httpServer = createServer(app);
    initializeChatSocket(httpServer);
    
    httpServer.listen(PORT,()=>{
        console.log(`server is running on port http://localhost:${PORT}`);
    })
}

test();
