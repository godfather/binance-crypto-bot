import { ApiHelper } from "../../api/api";
import { OrderResponse, OrderSide, OrderType } from "../../models/iOrder";
import Order, { IOrder } from "../../models/Order";
import { OrderBase } from "./OrderBase";

export class BuyOrder extends OrderBase {
    private _targetPrice: number; 
    private _stopPrice: number;
    
    public setTargetPrice(target: number): BuyOrder {
        this._targetPrice = target;
        return this;
    }
    
    public setStopPrice(stop: number): BuyOrder {
        this._stopPrice = stop;
        return this;
    }
    
    public newOrder(): Promise<IOrder> {
        return ApiHelper.getPrivateInstance()
            .newOrder(this.symbol, OrderSide.BUY, OrderType.MARKET, (this.minNotional * 2))
            .catch(console.log)
            .then(orderResponse => this.persistOrder(orderResponse!));
    }

    public persistOrder(orderResponse: OrderResponse): Promise<IOrder> {
        return new Order({...orderResponse, targetPrice: this._targetPrice, stopPrice: this._stopPrice}).save();
    }
}