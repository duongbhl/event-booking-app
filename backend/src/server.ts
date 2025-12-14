import { app } from "./app";
import { connectDB } from "./config/db"


const PORT = 5000

const test = async () =>{
    await connectDB();
    app.listen(PORT,()=>{
        console.log(`server is running on port http://localhost:${PORT}`);
    })
}

test();