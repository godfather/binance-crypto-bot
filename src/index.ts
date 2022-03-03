import { ApiHelper } from "./libs/api";
import { CandleType } from "./types/candle-types";
import { AxiosResponse } from "axios";
import { OrderSide, OrderType } from "./types/order-types";

// ApiHelper.getInstance().getLatestCandles('BTCBUSD').then((response) => {
//     console.log(response);
// });

// ApiHelper.getInstance(true).getWalletInfo().then((response) => {
//     console.log(response);
// });

// ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.SELL, OrderType.MARKET, 0.01).then((response) => {
//     console.log(response);
// }).catch(e => console.log(e));

ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.BUY, OrderType.MARKET, 0.03).then((response) => {
    console.log(response);

    ApiHelper.getInstance(true).getWalletInfo().then((response) => {
        console.log(response);
    });    
}).catch(e => console.log(e));