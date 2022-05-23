//VENDORS
import 'dotenv/config';
import WebSocket from "ws";
import { watch, readFile } from 'fs';

//LIBS
import { Socket } from "./libs/socket";
import { ApiHelper } from "./libs/api";
import { calcRSI } from "./libs/rsi-index";
import { OrderHelper } from './libs/order-helper';
import { conn } from './libs/mongo-connection';

//MODELS
import { CandleBase } from './models/candle-base';
import { Operation, WalletBase } from "./models/wallet-mode";
import Order, { IOrder } from './models/orders';
import Symbol, { ISymbol } from './models/symbol-config';

//TYPES
import { CandleCollection, CandleType, KlineCandle, CandlePrice, CandleStartTime } from "./types/candle-types";
import { OrderResponse, OrderSide, OrderType } from "./types/order-types";
import { CoinListType } from './types/coin-list-types';
import { EnumExangeInfoFilterType } from './types/info-types';
import { resolve } from 'path';
import { rejects } from 'assert';
import { exit } from 'process';

export class CryptoBot extends Socket {

    private _wallet:WalletBase|null;
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
    private _coins:ISymbol[];
    private _candlesIntialized:boolean;
    private _orderHelper:OrderHelper;        //initialize the orders helper – maybe we can move this helpers to another place
    private _updatingExchange:boolean;


    public constructor(apiAddress:string, wallet:WalletBase|null) {
        super();
        this._wallet = wallet;
        this._candles = [];
        this._prevCandlePrice = [];
        this._currentCandlePrice = [];
        this._currentStartTime = [];
        this._orders = [];
        this._candlesIntialized = false
        this._configPath = process.env.CONFIG_PATH!;
        this._sellAumont = parseFloat(process.env.SELL_AUMONT!);
        this._buyAumont = parseFloat(process.env.BUY_AUMONT!);
        this._updatingExchange = false;
        
        //initialize the orders helper – maybe we can move this helpers to another place
        this._orderHelper = OrderHelper.getInstance();

        this._baseWSAddress = apiAddress;
        
        this.mountWSURL(this._baseWSAddress, false);

        console.log(this._wallet!.status);
    }

    public onCryptoListChange():void {
        watch(this._configPath, (_, filename) => {
            if(filename && /coin/.test(filename)) this.mountWSURL(this._baseWSAddress, false);
        });        
    }

    public mountWSURL(baseApiAddress:string, restartBot:boolean):void {
        Symbol.find({}).then(symbols => {
            this._coins = symbols;

            if(!this._updatingExchange) {
                this._updateSymbolExchangeInfo().then(_ => {
                    const coinsList:string[] = this._coins.map(coin => `${coin.symbol.toLowerCase()}${coin.stable.toLowerCase()}@kline_1m`);
                    this.apiAddress = this._wsURL = `${baseApiAddress}stream?streams=${coinsList.join('/')}`;
        
                    console.log(this._wsURL);
                    
                    // this._orderHelper.reloadSymbols();
                    
                    if(!restartBot) this.run();
                    else {
                        this._initializeCandles();
                        this.restart();
                    }
                });
            }
        }).catch(err => console.log(err));
    }

    public onOpenHandler(_:WebSocket.Event):void {
        console.log('onOpenHandler');
        this._initializeCandles();        
    }

    public onMessageHandler(event:WebSocket.MessageEvent):void {
        if(!this._candlesIntialized) return; //not start the process if the candles collection isnt initialized

        const klineData = JSON.parse(event.data.toString()) as unknown as KlineCandle;                   //parse the current kline data into json 
        const ci = this._candles.findIndex(candle => candle.symbol === klineData.data.s);                //get the candle collection index
        const pi = this._prevCandlePrice.findIndex(price => price.symbol === klineData.data.s);          //get the prevCandlePrice index
        const ti = this._currentStartTime.findIndex(startTime => startTime.symbol === klineData.data.s); //get the currentStartTime index
        
        // console.log(this._candles[ci].symbol, `USD$ ${parseFloat(klineData.data.k.c).toFixed(2)}`);

        if(ci > -1 && this._candles[ci].candles.length < 1) return; // stop here if no have candles

        this._prevCandlePrice[pi].price = this._candles[ci].candles[this._candles[ci].candles.length -1].closePrice;   //Store the latest candle close price
        const candle = new CandleBase(klineData, this._prevCandlePrice[pi].price);                                     //convert into a Candle object
    
        // return this._createOrder(candle, OrderSide.SELL);

        //PROCESS ONLY IF CURRENT CANDLE START TIME IS DIFFERENT OF THE CANDLE START TIME
        if(this._currentStartTime[ti].timestamp == candle.openTimeMS) return;

        if(this._candles[ci].candles.length > 15) this._candles[ci].candles.shift(); // if has more than 15 candles remove one
        this._candles[ci].candles.push(candle);                                      // push the current candle to candles array
        this._currentStartTime[ti].timestamp = candle.openTimeMS;                    // update the current start time

        if(!this._updatingExchange) {
            this._updateSymbolExchangeInfo()
                .then(_ => console.log('LOT_SIZE && MIN_NOTIONAL UPDATED.'))
                .catch(err => console.error(err));
        }

        //BUY AND SELL ONLY IF THE NUMBER OF CANDLES IS BIGGER THAN 13
        if(this._candles[ci].candles.length > 13) {
            const rsi:number = calcRSI(this._candles[ci].candles.map((candle:CandleBase) => candle.closePrice)); //calculates the RSI 
            console.log(`${this._candles[ci].symbol} RSI: ${rsi}`); //print the current RSI

            //BUY IF RSI OVERMATCH 70
            if(rsi > 70 && rsi < 95) this._createOrder(candle, OrderSide.SELL);

            //BUY IF RSI IS ABOVE THE 30
            if(rsi < 30 && rsi > 5) this._createOrder(candle, OrderSide.BUY);

            //print candles
            console.table(this._candles[ci].candles);
            // console.log(this._prevCandlePrice[pi]);
        }
    }

    private _createOrder(candle:CandleBase, orderSide:OrderSide):void {
        console.log('_createOrder ' + orderSide);
        //choose the correct operation
        let operation = orderSide == OrderSide.BUY ? 'Comprando' : 'Vendendo';

        //get the current coin on coins collection
        const coin = this._coins.find(scoin => scoin.symbol === candle.symbol!.substring(0,3))!;
        
        //check if it's a order to buy 
        if(orderSide == OrderSide.BUY) {
            const balance = this._wallet!.status.balances.find(balance => balance.asset === coin.stable);
            if(parseFloat(balance!.free) < coin!.filters.minNotional || coin.aumont < coin!.filters.minNotional) {
                console.log(`Insufficient funds: BALANCE: ${balance?.free} SYMBOL: ${coin.filters.minNotional}`);
                return;
            }

            ApiHelper.getPrivateInstance().newOrder(candle.symbol!, orderSide, OrderType.MARKET, coin.filters.minNotional).then(response => {
                console.log(`${operation} ${coin.filters.minNotional / candle.closePrice} ${candle.symbol!.substring(0,3)} por ${coin.filters.minNotional} ${coin.stable}`);
                this._persistOrder(response);

                //decreate the symbol aumont and save it on db
                this._orderHelper.updateAumont(coin.symbol, (coin.filters.minNotional * -1)).then(_ => {
                    //update the coins collection with the new values
                    Symbol.find({}).then(symbols => this._coins = symbols);
                });

            }).catch(e => console.log(e));
        }

        if(orderSide == OrderSide.SELL) {
            Order.find({ sold:false, side:OrderSide.BUY, symbol:candle.symbol }).then(orders => {

                orders.forEach(order => {
                    const quantity:number = order.executedQty as number;
                    const price:number = quantity * candle.closePrice;
                    const cost:number = ((order.cummulativeQuoteQty as number) * (1 + coin.profit));

                    console.log(`START SEELING...`);
                    //if thee price is below the cost + 10%
                    if(price < cost) {
                        console.log(`SELL CANCELLED! THE PRICE(${price}) IS BELOW THE COST(${cost}) + PROFIT(5%) => DIFFERENCE: ${cost - price}`);
                        return;
                    }

                    ApiHelper.getPrivateInstance().newOrder(candle.symbol!, orderSide, OrderType.MARKET, quantity).then(response => {
                        console.log(`${operation} ${quantity} ${candle.symbol!.substring(0,3)} por ${quantity * candle.closePrice} ${coin.stable}`);
                        
                        this._persistOrder(response);

                        Order.findByIdAndUpdate({ _id:order._id }, { sold:true }, { upsert:true, new:true }).then(order => {
                            console.log(`SOLD ORDER ID: ${order._id}`);
                            
                            //decreate the symbol aumont and save it on db
                            this._orderHelper.updateAumont(coin.symbol, price).then(_ => {
                                //update the coins collection with the new values
                                Symbol.find({}).then(symbols => this._coins = symbols);
                            });

                        }).catch(err => console.error(err));                        
                    }).catch(e => console.log(e));
                });
            });
        }
    }

    private _persistOrder(orderResponse:OrderResponse):void {
        const averagePrice = orderResponse.fills.reduce((total, element) => total += parseFloat(element.price as string), 0);        
        orderResponse.averagePrice = (averagePrice / orderResponse.fills.length);

        if(orderResponse.side === OrderSide.SELL) {
            orderResponse.price = orderResponse.fills.reduce((total, element) => {
                return total += (parseFloat(element.qty as string) * parseFloat(element.price as string));
            }, 0).toString();

            orderResponse.sold = true;
        }

        Order.create(orderResponse).then(order => {
            this._orders.push(orderResponse); //update order
            console.log(`NEW ORDER ${order._id} SAVED`);
            console.table(this._orders); //log orders
        });
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
        this._coins.forEach(coin => {
            const symbolCoin = coin.symbol+coin.stable;
            console.log('Initialize: ' + symbolCoin);
            ApiHelper.getInstance().getLatestCandles(symbolCoin).then(response => {
                response.forEach((candle:CandleType, index:number) => {
                    const lastClosePrice = index === 0 ? 0 : parseFloat(response[index - 1][4] as string);
                    const currentCandle = new CandleBase(candle, lastClosePrice, symbolCoin);
                    this._pushCandleToCollection(currentCandle);
                });
               
                initalizedCount++;

                if(initalizedCount === this._coins.length) {
                    this._candlesIntialized = true;
                    console.log('Candles Initilized…');
                }
            })
        });
    }

    private _updateSymbolExchangeInfo():Promise<ISymbol[]> {
        this._updatingExchange = true;
        const exchangeInfo = ApiHelper.getInstance().getExchangeInfo(this._coins);
        
        return new Promise((resolve, reject) => {
            exchangeInfo.then(result => {
                let count = 0;
                const total = result.symbols.length;        

                result.symbols.forEach(symbol => {
                    const lotSize = symbol.filters.find(filter => filter.filterType == EnumExangeInfoFilterType.LOT_SIZE)!;
                    const minNotional = symbol.filters.find(filter => filter.filterType == EnumExangeInfoFilterType.MIN_NOTIONAL)!;
    
                    Symbol.findOneAndUpdate(
                      { symbol:symbol.baseAsset }, 
                      { $set:{ "filters.minQty": lotSize.minQty!, "filters.minNotional":minNotional.minNotional }},
                      { new:true }
                    ).then(coin => {
                        count++;
                        console.log(`UPDATE COIN: ${coin?.symbol} COUNT: ${count} FROM ${total}`);

                        const coinIndex = this._coins.findIndex( scoin => scoin.symbol == coin?.symbol );
                        if(coinIndex > -1) this._coins[coinIndex]! = coin as ISymbol;
                        else this._coins.push(coin as ISymbol);

                        if(count === total) {
                            this._updatingExchange = false;
                            return resolve(this._coins);
                        }
                    }).catch(err => {
                        this._updatingExchange = false;
                        return reject(err);
                    });        
                });    
            })
        });
    }
}
