import 'dotenv/config';
import { ApiHelper } from "./libs/api";
import { OrderResponse, OrderSide, OrderType } from "./types/order-types";
import { CandleType, KlineCandle } from "./types/candle-types";
import WebSocket from "ws";
import { CandleBase } from "./models/candle-base";
import { calcRSI } from "./libs/rsi-index";
import { Operation, WalletBase } from "./models/wallet-mode";
import { fstat, watch, readFile } from 'fs';


const sellAumont:number = parseFloat(process.env.SELL_AUMONT!);
const buyAumont:number = parseFloat(process.env.BUY_AUMONT!);
const ws = new WebSocket(`${process.env.WS_URI!}/btcbusd@kline_1m`);
const candles:CandleBase[] = [];
let prevCandlePrice:number = 0;
let currentStartTime:number = 0;
let orders:OrderResponse[]= [];

let wallet:WalletBase;

ws.onopen = async _ => {
    console.log("WS Connected");
/*
    //GETTING THE WALLET DATA
    wallet = new WalletBase(
        WalletBase.walletLimit(process.env.WALLET_LIMIT!),
        await WalletBase.loadExternalWallet()
    );

    //PRINTTING THE WALLET STATUS
    console.log(wallet.status);

    //LOADING FROM BINANCE THE LATEST CANDLES AND CONVERTING INTO CANDLES OBJECT ARRAY
    const response = await ApiHelper.getInstance().getLatestCandles('BTCBUSD');    
    response.forEach((candle:CandleType) => {
        const currentCandle = new CandleBase(candle, prevCandlePrice);
        candles.push(currentCandle);
        prevCandlePrice = currentCandle.closePrice;
    });
*/
}

ws.onclose = _ => {
    console.log("Connection closed");
}

ws.onerror = event => {
    console.log("Connection error: " + event.message);
}

ws.onmessage = async event => {
    console.log(event.data);
/*    
    prevCandlePrice = candles[candles.length -1].closePrice;                        //Store the latest candle close price
    const klineData = JSON.parse(event.data.toString()) as unknown as KlineCandle;  //parse the current kline data into json 
    const candle = new CandleBase(klineData, prevCandlePrice);                      //convert into a Candle object

    //PROCESS ONLY IF CURRENT CANDLE START TIME IS DIFFERENT OF THE CANDLE START TIME
    if(currentStartTime != candle.openTimeMS) {
        if(candles.length > 15) candles.shift(); // if has more than 15 candles remove one
        candles.push(candle);                    // push the current candle to candles array
        currentStartTime = candle.openTimeMS;    // update the current start time

        //BUY AND SELL ONLY IF THE NUMBER OF CANDLES IS BIGGER THAN 13
        if(candles.length > 13) {
            const rsi:number = calcRSI(candles.map((candle:CandleBase) => candle.closePrice)); //calculates the RSI 
            console.log(rsi); //print the current RSI

            //BUY IF RSI OVERMATCH 70
            if(rsi > 70) {
                console.log(`Vendendo ${process.env.SELL_AUMONT} BTC por ${candle.closePrice} USDT`);
                ApiHelper.getPrivateInstance().newOrder('BTCUSDT', OrderSide.SELL, OrderType.MARKET, sellAumont).then(response => {
                    orders.push(response); //update orders
                    console.table(orders); //log orders
                }).catch(e => console.log(e));
            }

            //BUY IF RSI IS ABOVE THE 30
            if(rsi < 30) {
                console.log(`Comprando ${process.env.SELL_AUMONT} BTC por ${candle.closePrice} USDT`);
                ApiHelper.getPrivateInstance().newOrder('BTCUSDT', OrderSide.BUY, OrderType.MARKET, buyAumont).then(response => {
                    orders.push(response); //update order
                    console.table(orders); //log orders
                }).catch(e => console.log(e));
            }
        }


        console.table(candles); //print candles
    }
*/
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
//     orders.push(await ApiHelper.getPrivateInstance().newOrder('BTCUSDT', OrderSide.SELL, OrderType.MARKET, 0.19));
//     let wallet:WalletBase = new WalletBase(
//         WalletBase.walletLimit(process.env.WALLET_LIMIT!),
//         await WalletBase.loadExternalWallet()
//     );
//     console.log(wallet.status);
    
//     wallet.updateAsset('USDT', 5000.35, Operation.DEC);

//     console.log(wallet.status);

//     wallet.limitReached('USDT');

// })();

watch('./config', (event, filename) => {
    console.log("THE EVENT: " + event);
    console.log("FILENAME: " + filename);

    if(filename && /coin/.test(filename)) {
        readFile(`./config/${filename}`, 'utf8', (err, dataString) => {
            if(err) {
                console.log(err);
                return;
            }

            let jsonString = JSON.parse(dataString);
            console.log(jsonString);
            console.log('RESTARTED');
        });
        // ws.restart();
    }
});
