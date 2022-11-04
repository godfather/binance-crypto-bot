import { IWallet } from "../../models/iWallet";
import { ApiHelper } from "../../api/api";
import { OrderResponse } from "../../models/iOrder";
import { IOrder } from "../../models/Order";

export abstract class OrderBase {
    public updateWallet(): Promise<IWallet> {
        return ApiHelper.getPrivateInstance().getWalletInfo();
    }
    
    abstract newOrder():Promise<OrderResponse>;
    abstract persistOrder():Promise<IOrder>;
}