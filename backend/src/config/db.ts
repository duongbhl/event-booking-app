import  Mongoose  from "mongoose"
import dotenv from 'dotenv'
dotenv.config()


export const connectDB = async ()=>{
    try {
        await Mongoose.connect(process.env.DB_URI)
        console.log("CONNECTION SUCCESFULLY")
    } catch (error) {
        console.log("CONNECTION FAILED",error)
    }
}