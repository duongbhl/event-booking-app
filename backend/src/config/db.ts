import  Mongoose  from "mongoose"
import "./env";


export const connectDB = async ()=>{
    try {
        await Mongoose.connect(process.env.DB_URI!)
        console.log("CONNECTION SUCCESFULLY")
    } catch (error) {
        console.log("CONNECTION FAILED",error)
    }
}
