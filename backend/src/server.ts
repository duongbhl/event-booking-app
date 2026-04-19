import { app } from "./app";
import { connectDB } from "./config/db"
import { startEventReminderScheduler } from "./utils/eventReminder";


const PORT = 5000

const test = async () =>{
    await connectDB();
    
    // Start event reminder scheduler
    startEventReminderScheduler();
    
    app.listen(PORT,()=>{
        console.log(`server is running on port http://localhost:${PORT}`);
    })
}

test();