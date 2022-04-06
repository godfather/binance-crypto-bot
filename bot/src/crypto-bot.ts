import 'dotenv/config';
import { Socket } from "./libs/socket";
import WebSocket from "ws";
import { watch, readFile } from 'fs';
import { Operation, WalletBase } from "./models/wallet-mode";
import { ApiHelper } from "./libs/api";
import { CandleBase } from './models/candle-base';
import { calcRSI } from "./libs/rsi-index";

//TYPES
import { CandleCollection, CandleType, KlineCandle, CandlePrice } from "./types/candle-types";
import { OrderResponse, OrderSide, OrderType } from "./types/order-types";
import { CoinListType } from './types/coin-list-types';

export class CryptoBot extends Socket {

    private _wallet:WalletBase
    private _candles:CandleCollection[];
    private _prevCandlePrice:CandlePrice[];
    private _currentStartTime:number;
    private _orders:OrderResponse[];
    private _sellAumont:number;
    private _buyAumont:number;
    private _count:number;
    private _configPath:string;
    private _wsURL:string;
    private _baseWSAddress:string;
    private _coins:CoinListType;

    public constructor(apiAddress:string, wallet:WalletBase) {
        super(apiAddress);
        this._wallet = wallet;
        this._candles = [];
        this._prevCandlePrice = [];
        this._currentStartTime = 0;
        this._orders = [];

        this._count = 0;
        this._configPath = process.env.CONFIG_PATH!;

        this._sellAumont = parseFloat(process.env.SELL_AUMONT!);
        this._buyAumont = parseFloat(process.env.BUY_AUMONT!);

        this._baseWSAddress = apiAddress;
        
        this.mountWSURL(this._baseWSAddress, 'coins.json', false);

        console.log(this._wallet.status);
    }

    public onCryptoListChange():void {
        watch(this._configPath, (_, filename) => {
            if(filename && /coin/.test(filename)) this.mountWSURL(this._baseWSAddress, filename, false);
        });        
    }

    public mountWSURL(baseApiAddress:string, filename:string, restartBot:boolean):void {
        const configPath = process.env.CONFIG_PATH!;
        readFile(`${configPath}/${filename}`, 'utf8', (err, dataString) => {
            if(err) throw err;        

            this._coins = JSON.parse(dataString);
            
            if(this._coins.cryptoCoins.length < 2) this._wsURL = `${baseApiAddress}ws/${this._coins.cryptoCoins[0].toLowerCase()}${this._coins.stableCoin.toLowerCase()}@kline_1m`;
            else {
                const coinsList:string[] = this._coins.cryptoCoins.map(coin => `${coin.toLowerCase()}${this._coins.stableCoin.toLowerCase()}@kline_1m`);
                this._wsURL = `${baseApiAddress}stream?streams=${coinsList.join('/')}`;
            }

            this.apiAddress = this._wsURL;

            console.log(this._wsURL);
            restartBot ? this.restart() : this.run();
        });
    }

    public onOpenHandler(_:WebSocket.Event):void {
        console.log('onOpenHandler');
        //LOADING FROM BINANCE THE LATEST CANDLES AND CONVERTING INTO CANDLES OBJECT ARRAY

        this._coins.cryptoCoins.forEach(symbol => {
            const symbolCoin = symbol+this._coins.stableCoin;
            ApiHelper.getInstance().getLatestCandles(symbolCoin).then(response => {
                response.forEach((candle:CandleType) => {
                    const currentCandle = new CandleBase(candle, 0, symbolCoin);
                    this._pushCandleToCollection(currentCandle);
                });
            })
        });

    }

    public onMessageHandler(event:WebSocket.MessageEvent):void {
        this._count++;
        console.log('COUNT: ' + this._count);
        console.log(JSON.parse(event.data.toString()));

        console.log(this._candles);
        console.log(this._prevCandlePrice);

        return;

        // if(this._candles.length < 1) return; // stop here if no have candles

        // this._prevCandlePrice = this._candles[this._candles.length -1].closePrice;      //Store the latest candle close price
        // const klineData = JSON.parse(event.data.toString()) as unknown as KlineCandle;  //parse the current kline data into json 
        // const candle = new CandleBase(klineData, this._prevCandlePrice);                //convert into a Candle object
    
        // //PROCESS ONLY IF CURRENT CANDLE START TIME IS DIFFERENT OF THE CANDLE START TIME
        // if(this._currentStartTime != candle.openTimeMS) {
        //     if(this._candles.length > 15) this._candles.shift(); // if has more than 15 candles remove one
        //     this._candles.push(candle);                          // push the current candle to candles array
        //     this._currentStartTime = candle.openTimeMS;          // update the current start time

        //     //BUY AND SELL ONLY IF THE NUMBER OF CANDLES IS BIGGER THAN 13
        //     if(this._candles.length > 13) {
        //         const rsi:number = calcRSI(this._candles.map((candle:CandleBase) => candle.closePrice)); //calculates the RSI 
        //         console.log(rsi); //print the current RSI

        //         //BUY IF RSI OVERMATCH 70
        //         if(rsi > 70) this._createOrder(candle, OrderSide.SELL, this._sellAumont);

        //         //BUY IF RSI IS ABOVE THE 30
        //         if(rsi < 30 && rsi > 5) this._createOrder(candle, OrderSide.BUY, this._buyAumont);
        //     }

        //     console.table(this._candles); //print candles
        // }
    }

    private _createOrder(candle:CandleBase, orderSide:OrderSide, aumont:number):void {
        let operation = orderSide == OrderSide.BUY ? 'Comprando' : 'Vendendo';
        console.log(`${operation} ${aumont} BTC por ${candle.closePrice} USDT`);
        // ApiHelper.getPrivateInstance().newOrder('BTCUSDT', orderSide, OrderType.MARKET, aumont).then(response => {
        //     this._orders.push(response); //update order
        //     console.table(this._orders); //log orders
        // }).catch(e => console.log(e));
    }

    private _pushCandleToCollection(currentCandle:CandleBase):void {
        const collectionIndex = this._candles.findIndex(candle => candle.symbol === currentCandle.symbol);
        if(collectionIndex === -1) this._candles.push({ symbol:currentCandle.symbol!, candles:[currentCandle] });
        else this._candles[collectionIndex].candles.push(currentCandle);
        this._setPreviousCandlePrice(currentCandle.symbol!, currentCandle.closePrice);
    }

    private _setPreviousCandlePrice(symbol:string, price:number):void {
        const priceIndex = this._prevCandlePrice.findIndex(priceItem => priceItem.symbol === symbol);
        if(priceIndex === -1) this._prevCandlePrice.push({ symbol:symbol, price:price });
        else this._prevCandlePrice[priceIndex].price = price;
    }
}
