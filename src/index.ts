import { ApiHelper } from "./libs/api";
// import { OrderSide, OrderType } from "./types/order-types";
import { CandleType, KlineCandle } from "./types/candle-types";
import WebSocket from "ws";
import { CandleBase } from "./models/candle-base";
import { calcRSI } from "./libs/rsi-index";

const ws = new WebSocket(`${process.env.WS_URI!}/btcbusd@kline_1m`);
const candles:CandleBase[] = [];
let prevCandlePrice:number = 0;
let currentStartTime:number = 0;



ws.onopen = async _ => {
    console.log("New connection opened");
    const response = await ApiHelper.getInstance().getLatestCandles('BTCBUSD');
    
    response.forEach((candle:CandleType) => {
        const currentCandle = new CandleBase(candle, prevCandlePrice);
        candles.push(currentCandle);
        prevCandlePrice = currentCandle.closePrice;
    });
}

ws.onclose = _ => {
    console.log("Connection closed");
}

ws.onerror = event => {
    console.log("Connection error: " + event.message);
}

ws.onmessage = event => {
    prevCandlePrice = candles[candles.length -1].closePrice;
    const klineData = JSON.parse(event.data.toString()) as unknown as KlineCandle;
    const candle = new CandleBase(klineData, prevCandlePrice);
    // console.log(klineData);
    // console.log(candle);

    if(currentStartTime != candle.openTimeMS) {
        if(candles.length > 15) candles.shift();
        candles.push(candle);
        currentStartTime = candle.openTimeMS;

        if(candles.length > 13) console.log(calcRSI(candles.map((candle:CandleBase) => candle.closePrice)));
        console.table(candles);
    }
}

// ApiHelper.getInstance(true).getWalletInfo().then((response) => {
//     console.log(response);
// });

// ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.SELL, OrderType.MARKET, 0.01).then((response) => {
//     console.log(response);
// }).catch(e => console.log(e));

// ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.BUY, OrderType.MARKET, 0.03).then((response) => {
//     console.log(response);

//     ApiHelper.getInstance(true).getWalletInfo().then((response) => {
//         console.log(response);
//     });    
// }).catch(e => console.log(e));

