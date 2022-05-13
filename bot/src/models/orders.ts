import mongoose, { Document, Decimal128 } from "mongoose";
import { OrderResponse, OrderStatus, OrderTimeInForce, OrderType, OrderSide } from "../types/order-types";
import { conn } from "../libs/mongo-connection";

export interface IOrder extends Document, OrderResponse {}

const convertToNumber = (value:any) => {
    return typeof value !== 'undefined' ? parseFloat(value.toString()) : value;
}

const orderSchema = new mongoose.Schema({
    symbol: {
        type:String,
        required:true,
        trim:true
    },
    orderId: {
        type:Number,
        required:true,
    },
    orderListId: {
        type:Number,
        required:true,
    },
    clientOrderId: {
        type:String,
        required:true,
        trim:true       
    },
    transactTime: {
        type:Number,
        required:true,
    },
    price: {
        type:String,
        required:true,
        get:convertToNumber
    },
    origQty: {
        type:mongoose.Schema.Types.Decimal128,
        required:true,
        get:convertToNumber
    },
    executedQty: {
        type:mongoose.Schema.Types.Decimal128,
        required:true,
        get:convertToNumber
    },
    cummulativeQuoteQty: {
        type:mongoose.Schema.Types.Decimal128,
        required:true,
        get:convertToNumber
    },
    status: {
        type:String,
        enum: Object.values(OrderStatus),
    },
    timeInForce: {
        type:String,
        enum: Object.values(OrderTimeInForce),
    },
    type: {
        type:String,
        enum: Object.values(OrderType),
    },
    side: {
        type:String,
        enum: Object.values(OrderSide),
    },
    sold: {
        type:Boolean,
        required:true,
        default:false
    },
    averagePrice: {
        type:mongoose.Schema.Types.Decimal128,
        required:true,
        default:0,
        get:convertToNumber
    },
    fills: [
        {
            price: {
                type:mongoose.Schema.Types.Decimal128,
                required:true,
                get:convertToNumber
            },
            qty: {
                type:mongoose.Schema.Types.Decimal128,
                required:true,
                get:convertToNumber
            },
            commission: {
                type:mongoose.Schema.Types.Decimal128,
                required:true,
                get:convertToNumber
            },
            commissionAsset: {
                type:String,
                required:true
            },
            tradeId: {
                type:Number,
                required:true,
            }        
        }
    ]
}, {toJSON: {getters: true}});

orderSchema.set('timestamps', true);

export default conn.model<IOrder>('Order', orderSchema);
