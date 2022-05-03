import { conn } from './libs/mongo-connection';
import Order, { IOrder } from './models/orders';
import { OrderResponse } from './types/order-types';
import { Decimal128 } from 'mongoose';
import { OrderHelper } from './libs/order-helper';


const data = {
    "symbol": "BTCUSDT",
    "orderId": 28,
    "orderListId": -1, //Unless OCO, value will be -1
    "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
    "transactTime": 1507725176595,
    "price": "4.01000000",
    "origQty": "10.00000000",
    "executedQty": "10.00000000",
    "cummulativeQuoteQty": "10.00000000",
    "status": "FILLED",
    "timeInForce": "GTC",
    "type": "MARKET",
    "side": "SELL",
    "fills": [
      {
        "price": "4000.00000000",
        "qty": "1.00000000",
        "commission": "4.00000000",
        "commissionAsset": "USDT",
        "tradeId": 56
      },
      {
        "price": "3999.00000000",
        "qty": "5.00000000",
        "commission": "19.99500000",
        "commissionAsset": "USDT",
        "tradeId": 57
      },
      {
        "price": "3998.00000000",
        "qty": "2.00000000",
        "commission": "7.99600000",
        "commissionAsset": "USDT",
        "tradeId": 58
      },
      {
        "price": "3997.00000000",
        "qty": "1.00000000",
        "commission": "3.99700000",
        "commissionAsset": "USDT",
        "tradeId": 59
      },
      {
        "price": "3995.00000000",
        "qty": "1.00000000",
        "commission": "3.99500000",
        "commissionAsset": "USDT",
        "tradeId": 60
      }
    ]
  };

const main = async (callback:Function) => callback();

main(async () => {
    await conn;
    const order = await Order.create(data);
    console.log(order);
    

    // const ordersHelper = OrderHelper.getInstance();
    // ordersHelper.init(101, [ "BTC","ETH","LTC" ]);
    // ordersHelper.getAumont("BTC", 38350).then(aumont => {
    //     console.log(`AQUI: ${aumont}`);
    // });
});
