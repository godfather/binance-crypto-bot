import { ApiHelper } from "../../api/api";
import { OrderResponse, OrderSide, OrderType } from "../../models/iOrder";
import Order, { IOrder } from "../../models/Order";
import { OrderBase } from "./OrderBase";

export class SellOrder extends OrderBase {
    private _currentPrice: number;

    public setCurrentPrice(currentPrice:number): SellOrder {
        this._currentPrice = currentPrice;
        console.log('this._currentPrice ' + this._currentPrice);
        return this;
    }

    public newOrder(): Promise<IOrder | void> {
        return Order.find({ symbol:this.symbol, sold:false, side:OrderSide.BUY })
            .then(orders => {
                let volumeToSell = 0;
                const ordersToSell: IOrder[] = [];

                orders.forEach(order => {
                    const currentPaymentForQtd = (order.executedQty as number) * this._currentPrice;

                    
                    if(currentPaymentForQtd < order.cummulativeQuoteQty) return;                    
                    volumeToSell += order.executedQty as number;
                    //apague
                    console.log(`ID: ${order._id} – currentPaymentForQtd  ${currentPaymentForQtd} – cummulativeQuoteQty  ${order.cummulativeQuoteQty}`);
                    ordersToSell.push(order);
                });
                
                const currentVolumePriceToSell = volumeToSell * this._currentPrice;
                if(currentVolumePriceToSell < this.minNotional) return;

                return ApiHelper.getPrivateInstance()
                    .newOrder(this.symbol, OrderSide.SELL, OrderType.MARKET, volumeToSell)
                    .catch(console.log)
                    .then(orderResponse => {
                        if(!orderResponse) return;
                        Promise.all(ordersToSell.map(order => {
                            order.sold = true;
                            order.save();
                        }));

                        orderResponse.sold = true;
                        return this.persistOrder(orderResponse);
                    });
            }).catch(error => console.log(error.message));
    }

    public persistOrder(orderResponse: OrderResponse): Promise<IOrder> {
        return new Order(orderResponse).save();
    }
}