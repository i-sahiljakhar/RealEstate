import mongoose, { mongo } from "mongoose";

export const connectDB = async ()=>{
    try{

        await mongoose.connect('mongodb://localhost:27017/realEstate');
        console.log('DB CONNECTED')
    }
    catch(error){
        console.error('DB connection error:',error.message)
    }
}