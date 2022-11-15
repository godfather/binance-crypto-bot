import { IWallet } from "../../models/iWallet";
import { ApiHelper } from "../../api/api";
import { OrderResponse } from "../../models/iOrder";
import { IOrder } from "../../models/Order";

export abstract class OrderBase {
    constructor(
        public symbol: string,
        public investiment: number
    ) {}
    
    abstract newOrder(quantity: number):Promise<OrderResponse>;
    abstract persistOrder(orderResponse: OrderResponse):Promise<IOrder>;
}