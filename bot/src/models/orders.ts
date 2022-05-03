import mongoose, { Document, Decimal128 } from "mongoose";
import { OrderResponse, OrderStatus, OrderTimeInForce, OrderType, OrderSide } from "../types/order-types";

export interface IOrder extends Document, OrderResponse {}

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
        required:true
    },
    origQty: {
        type:mongoose.Schema.Types.Decimal128,
        required:true
    },
    executedQty: {
        type:mongoose.Schema.Types.Decimal128,
        required:true
    },
    cummulativeQuoteQty: {
        type:mongoose.Schema.Types.Decimal128,
        required:true
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
    fills: [
        {
            price: {
                type:mongoose.Schema.Types.Decimal128,
                required:true
            },
            qty: {
                type:mongoose.Schema.Types.Decimal128,
                required:true
            },
            commission: {
                type:mongoose.Schema.Types.Decimal128,
                required:true
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
});

export default  mongoose.model<IOrder>('Order', orderSchema);
