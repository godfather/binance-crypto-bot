import { conn } from './libs/mongo-connection';
import Order, { IOrder } from './models/orders';
import { OrderResponse, OrderSide } from './types/order-types';
import { Decimal128 } from 'mongodb';
import { OrderHelper } from './libs/order-helper';
import { ApiHelper } from './libs/api';
import Symbol, { ISymbol } from './models/symbol-config';
import { EnumExangeInfoFilterType } from './types/info-types';


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



const data2 = 	{
  "symbol" : "MAMAMIA",
  "orderId" : 4195815,
  "orderListId" : -1,
  "clientOrderId" : "oKK7vl27SAMMUthMtEPbjf",
  "transactTime" : 1652416261911,
  "price" : "0.00000000",
  "origQty" : "0.08624000",
  "executedQty" : "0.08624000",
  "cummulativeQuoteQty" : "2631.79880869",
  "status" : "FILLED",
  "timeInForce" : "GTC",
  "type" : "MARKET",
  "side" : "SELL",
  "sold" : false,
  "averagePrice" : 0,
  "fills" : [
    {
      "price" : "30518.68000000",
      "qty" : "0.05767000",
      "commission" : "0.00000000",
      "commissionAsset" : "USDT",
      "tradeId" : 1954550,
    },
    {
      "price" : "30514.08000000",
      "qty" : "0.00415300",
      "commission" : "0.00000000",
      "commissionAsset" : "USDT",
      "tradeId" : 1954551,
    },
    {
      "price" : "30514.05000000",
      "qty" : "0.02441700",
      "commission" : "0.00000000",
      "commissionAsset" : "USDT",
      "tradeId" : 1954552,
    }
  ],
};

const main = async (callback:Function) => callback();

main(async () => {
  const orderResponse = data2 as OrderResponse;
  const averagePrice = orderResponse.fills.reduce((total, element) => total += parseFloat(element.price as string), 0);

  orderResponse.averagePrice = (averagePrice / orderResponse.fills.length);

  if(orderResponse.side === OrderSide.SELL) {
    orderResponse.price = orderResponse.fills.reduce((total, element) => {
        return total += (parseFloat(element.qty as string) * parseFloat(element.price as string));
    }, 0).toString();
}


  // console.log(orderResponse); 

  Order.create(orderResponse).then(order => console.log(`NEW ORDER ${order._id} SAVED`));
});
