import { ApiHelper } from "../../api/api";
import { OrderResponse, OrderSide, OrderType } from "../../models/iOrder";
import Order, { IOrder } from "../../models/Order";
import { OrderBase } from "./OrderBase";

export class BuyOrder extends OrderBase {
    public newOrder(): Promise<OrderResponse> {
        return ApiHelper.getPrivateInstance().newOrder(this.symbol, OrderSide.BUY, OrderType.MARKET, this.investiment);
    }

    public persistOrder(orderResponse: OrderResponse): Promise<IOrder> {
        return new Order(orderResponse).save();
    }
}