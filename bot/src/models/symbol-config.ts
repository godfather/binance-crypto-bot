import mongoose, { Decimal128, Document } from "mongoose";
import { conn } from "../libs/mongo-connection";

export interface ISymbol extends Document {
    symbol:string;
    stable:string;
    aumont:number;
    filters:{
        minQty:number;
        minNotional:number;
    }
}

const convertToNumber = (value:any) => {
    return typeof value !== 'undefined' ? parseFloat(value.toString()) : value;
}

const symbolSchema = new mongoose.Schema({
    symbol: {
        type:String,
        required:true,
        trim:true
    },
    stable: {
        type:String,
        required:true,
        trim:true
    },
    aumont: {
        type:mongoose.Schema.Types.Decimal128,
        required:true,
        default:0, 
        get:convertToNumber
    },
    filters: {
        minQty: {
            type:mongoose.Schema.Types.Decimal128,
            default:0,
            get:convertToNumber
        },
        minNotional: {
            type:mongoose.Schema.Types.Decimal128,
            default:0,
            get:convertToNumber
        }
    }
}, {toJSON: {getters: true}});

symbolSchema.set('timestamps', true);

export default conn.model<ISymbol>('Symbol', symbolSchema);
