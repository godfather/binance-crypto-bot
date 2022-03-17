import 'dotenv/config';
import { ApiHelper } from "./libs/api";
import { OrderResponse, OrderSide, OrderType } from "./types/order-types";
import { CandleType, KlineCandle } from "./types/candle-types";
import WebSocket from "ws";
import { CandleBase } from "./models/candle-base";
import { calcRSI } from "./libs/rsi-index";
import { Operation, WalletBase } from "./models/wallet-mode";

const sellAumont:number = parseFloat(process.env.SELL_AUMONT!);
const buyAumont:number = parseFloat(process.env.BUY_AUMONT!);
const ws = new WebSocket(`${process.env.WS_URI!}/btcbusd@kline_1m`);
const candles:CandleBase[] = [];
let prevCandlePrice:number = 0;
let currentStartTime:number = 0;
let orders:OrderResponse[]= [];

let wallet:WalletBase;

ws.onopen = async _ => {
    console.log("New connection opened");
    wallet = new WalletBase(
        WalletBase.walletLimit(process.env.WALLET_LIMIT!),
        await WalletBase.loadExternalWallet()
    );

    console.log(wallet.status);

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

ws.onmessage = async event => {
    
    // console.log(response);
    // ws.close();

    prevCandlePrice = candles[candles.length -1].closePrice;
    const klineData = JSON.parse(event.data.toString()) as unknown as KlineCandle;
    const candle = new CandleBase(klineData, prevCandlePrice);
    // console.log(klineData);
    // console.log(candle);

    if(currentStartTime != candle.openTimeMS) {
        if(candles.length > 15) candles.shift();
        candles.push(candle);
        currentStartTime = candle.openTimeMS;

        if(candles.length > 13) {
            const rsi:number = calcRSI(candles.map((candle:CandleBase) => candle.closePrice));
            console.log(rsi);

            if(rsi > 70) {
                console.log(`Vendendo ${process.env.SELL_AUMONT} BTC por ${candle.closePrice} USDT`);
                ApiHelper.getPrivateInstance().newOrder('BTCUSDT', OrderSide.SELL, OrderType.MARKET, sellAumont).then(response => {
                    orders.push(response);
                    console.table(orders);
                }).catch(e => console.log(e));;
            }

            if(rsi < 30) {
                console.log(`Comprando ${process.env.SELL_AUMONT} BTC por ${candle.closePrice} USDT`);
                ApiHelper.getPrivateInstance().newOrder('BTCUSDT', OrderSide.BUY, OrderType.MARKET, buyAumont).then(response => {
                    orders.push(response);
                    console.table(orders);
                }).catch(e => console.log(e));;
            }
        }
        console.table(candles);
    }
}

// ----------- //

// ApiHelper.getInstance(true).getWalletInfo().then((response) => {
//     console.log(response);
// });

// ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.SELL, OrderType.MARKET, 0.01).then((response) => {
//     console.log(response);
// }).catch(e => console.log(e));

// ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.BUY, OrderType.MARKET, buyAumont).then((response) => {
//     console.log(response);

//     ApiHelper.getInstance(true).getWalletInfo().then((response) => {
//         console.log(response);
//     });    
// }).catch(e => console.log(e));


// (async () => {
//     // orders.push(await ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.BUY, OrderType.MARKET, buyAumont));
//     let wallet:WalletBase = new WalletBase(
//         WalletBase.walletLimit(process.env.WALLET_LIMIT!),
//         await WalletBase.loadExternalWallet()
//     );
//     console.log(wallet.status);
    
//     wallet.updateAsset('USDT', 5000.35, Operation.DEC);

//     console.log(wallet.status);

//     wallet.limitReached('USDT');

// })();
