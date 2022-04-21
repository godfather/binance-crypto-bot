import 'dotenv/config';
import { Socket } from "./libs/socket";
import WebSocket from "ws";
import { watch, readFile } from 'fs';
import { Operation, WalletBase } from "./models/wallet-mode";
import { ApiHelper } from "./libs/api";
import { CandleBase } from './models/candle-base';
import { calcRSI } from "./libs/rsi-index";
import { State } from './libs/state';

//TYPES
import { CandleCollection, CandleType, KlineCandle, CandlePrice, CandleStartTime } from "./types/candle-types";
import { OrderResponse, OrderSide, OrderType } from "./types/order-types";
import { CoinListType } from './types/coin-list-types';

export class CryptoBot extends Socket {

    private _wallet:WalletBase
    private _candles:CandleCollection[];
    private _prevCandlePrice:CandlePrice[];
    private _currentCandlePrice:CandlePrice[];
    private _currentStartTime:CandleStartTime[];
    private _orders:OrderResponse[];
    private _sellAumont:number;
    private _buyAumont:number;
    private _configPath:string;
    private _wsURL:string;
    private _baseWSAddress:string;
    private _coins:CoinListType;
    private _candlesIntialized:boolean;
    private _state:State;

    public constructor(apiAddress:string, wallet:WalletBase) {
        super();
        this._wallet = wallet;
        this._candles = [];
        this._prevCandlePrice = [];
        this._currentCandlePrice = [];
        this._currentStartTime = [];
        this._orders = [];
        this._candlesIntialized = false
        this._state = State.getInstance();
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
            
            const coinsList:string[] = this._coins.cryptoCoins.map(coin => `${coin.toLowerCase()}${this._coins.stableCoin.toLowerCase()}@kline_1m`);
            this._wsURL = `${baseApiAddress}stream?streams=${coinsList.join('/')}`;

            this.apiAddress = this._wsURL;

            console.log(this._wsURL);
            if(!restartBot) this.run();
            else {
                this._initializeCandles();
                this.restart();
            }
        });
    }

    public onOpenHandler(_:WebSocket.Event):void {
        console.log('onOpenHandler');
        this._initializeCandles();        
    }

    public onMessageHandler(event:WebSocket.MessageEvent):void {
        if(!this._candlesIntialized) return; //not start the process if the candles collection isnt initialized

        const klineData = JSON.parse(event.data.toString()) as unknown as KlineCandle;  //parse the current kline data into json 
        const ci = this._candles.findIndex(candle => candle.symbol === klineData.data.s); //get the candle collection index
        const pi = this._prevCandlePrice.findIndex(price => price.symbol === klineData.data.s); //get the prevCandlePrice index
        const ti = this._currentStartTime.findIndex(startTime => startTime.symbol === klineData.data.s); //get the currentStartTime index
        
        console.log(this._candles[ci].symbol, klineData.data.s, klineData.data.k.c);

        if(ci > -1 && this._candles[ci].candles.length < 1) return; // stop here if no have candles

        this._prevCandlePrice[pi].price = this._candles[ci].candles[this._candles[ci].candles.length -1].closePrice;   //Store the latest candle close price
        const candle = new CandleBase(klineData, this._prevCandlePrice[pi].price);                                     //convert into a Candle object

        const eventkey:string = `${candle.openTimeMS}${candle.symbol}`;
        this._state.dispatchEvent(eventkey);
    
        //PROCESS ONLY IF CURRENT CANDLE START TIME IS DIFFERENT OF THE CANDLE START TIME
        if(this._currentStartTime[ti].timestamp == candle.openTimeMS) return;

        if(this._candles[ci].candles.length > 15) this._candles[ci].candles.shift(); // if has more than 15 candles remove one
        this._candles[ci].candles.push(candle);                          // push the current candle to candles array
        this._currentStartTime[ti].timestamp = candle.openTimeMS;        // update the current start time

        //BUY AND SELL ONLY IF THE NUMBER OF CANDLES IS BIGGER THAN 13
        if(this._candles[ci].candles.length > 13) {
            this._state.addEventListener(eventkey, {
                type:OrderSide.BUY,
                symbol:candle.symbol!,
                handler: (price:number) => { 
                    console.log(`EVENT: ${eventkey} SIZE: ${this._state.stateSize}`);
                    console.log(`EVENT: ${eventkey} PRICE: ${price} CURRENT-PRICE: ${candle.closePrice}`);                    
                }
            });


            const rsi:number = calcRSI(this._candles[ci].candles.map((candle:CandleBase) => candle.closePrice)); //calculates the RSI 
            console.log(`${this._candles[ci].symbol}: ${rsi}`); //print the current RSI

            //BUY IF RSI OVERMATCH 70
            if(rsi > 70 && rsi < 95) this._createOrder(candle, OrderSide.SELL, this._sellAumont);

            //BUY IF RSI IS ABOVE THE 30
            if(rsi < 30 && rsi > 5) this._createOrder(candle, OrderSide.BUY, this._buyAumont);

            //print candles
            console.table(this._candles[ci].candles);
            console.log(this._prevCandlePrice[pi]);
        }
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
        this._setCandlePrice(currentCandle.symbol!, currentCandle.closePrice, this._prevCandlePrice);
        this._setCurrentStartTime(currentCandle.symbol!, currentCandle.openTimeMS);
    }

    private _setCandlePrice(symbol:string, price:number, candlePriceCollection:CandlePrice[]):void {
        const priceIndex = candlePriceCollection.findIndex(priceItem => priceItem.symbol === symbol);
        if(priceIndex === -1) candlePriceCollection.push({ symbol:symbol, price:price });
        else candlePriceCollection[priceIndex].price = price;
    }

    private _setCurrentStartTime(symbol:string, timestamp:number):void {
        const timeIndex = this._currentStartTime.findIndex(timeItem => timeItem.symbol === symbol);
        if(timeIndex === -1) this._currentStartTime.push({ symbol:symbol, timestamp:timestamp });
        else this._currentStartTime[timeIndex].timestamp = timestamp;
    }

    private _initializeCandles() {
        console.log('initializeCandles');
        this._candles = [];
        this._candlesIntialized = false;
        let initalizedCount:number = 0;

        //LOADING FROM BINANCE THE LATEST CANDLES AND CONVERTING INTO CANDLES OBJECT ARRAY
        this._coins.cryptoCoins.forEach(symbol => {
            const symbolCoin = symbol+this._coins.stableCoin;
            ApiHelper.getInstance().getLatestCandles(symbolCoin).then(response => {
                response.forEach((candle:CandleType) => {
                    const currentCandle = new CandleBase(candle, 0, symbolCoin);
                    this._pushCandleToCollection(currentCandle);
                });
               
                initalizedCount++;

                if(initalizedCount ===  this._coins.cryptoCoins.length) {
                    this._candlesIntialized = true;
                    console.log('Candles Initilized…');
                }
            })
        });
    }
}
