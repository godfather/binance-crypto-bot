import { IWallet } from "../../models/iWallet";
import { ApiHelper } from "../../api/api";
import { OrderResponse } from "../../models/iOrder";
import { IOrder } from "../../models/Order";

export abstract class OrderBase {
    constructor(
        public symbol: string,
        public walletBalance: number,
        public investiment: number
    ) {}

    get walletHasBalance(): boolean {
        return this.walletBalance >= this.investiment; 
    }

    protected updateWallet(): Promise<IWallet> {
        return ApiHelper.getPrivateInstance().getWalletInfo();
    }
    
    abstract newOrder(quantity: number):Promise<OrderResponse>;
    abstract persistOrder(orderResponse: OrderResponse):Promise<IOrder>;
}