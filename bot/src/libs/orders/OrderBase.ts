import { IWallet } from "../../models/iWallet";
import { ApiHelper } from "../../api/api";
import { OrderResponse } from "../../models/iOrder";
import { IOrder } from "../../models/Order";

export abstract class OrderBase {
    constructor(
        public symbol: string,
        public minNotional: number
    ) {}
    
    abstract newOrder():Promise<IOrder | void>;
    abstract persistOrder(orderResponse: OrderResponse):Promise<IOrder>;
}