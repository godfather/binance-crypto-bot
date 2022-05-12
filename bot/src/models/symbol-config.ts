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
        default:0
    },
    filters: {
        minQty: {
            type:mongoose.Schema.Types.Decimal128,
            default:0
        },
        minNotional: {
            type:mongoose.Schema.Types.Decimal128,
            default:0
        }
    }
});

export default conn.model<ISymbol>('Symbol', symbolSchema);
