// import mongoose, { mongo } from "mongoose";

// export const connectDB = async ()=>{
//     try{

//         await mongoose.connect('');
//         console.log('DB CONNECTED')
//     }
//     catch(error){
//         console.error('DB connection error:',error.message)
//     }
// }

import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async ()=>{
    try{
const MONGO_URI= process.env.MONGO_URI || 'mongodb://localhost:27017/realEstate'
        await mongoose.connect(MONGO_URI);
        console.log('DB CONNECTED')
    }
    catch(error){
        console.error('DB connection error:',error.message)
    }
}