import mongoose, { Document } from "mongoose";
import { conn } from "../libs/db/MongoConnection";

export interface BlackList extends Document {};

const blackListSchema = new mongoose.Schema({
    symbol: {
        type:String,
        required:true,
        trim:true
    },
}, {toJSON: {getters: true}});



blackListSchema.set('timestamps', true);

export default conn.model<BlackList>('BlackList', blackListSchema);
