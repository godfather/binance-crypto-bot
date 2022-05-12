import 'dotenv/config';
import { BaseHttpClient } from "./base-http-client";
import { CandleType } from "../types/candle-types";
import { Wallet } from '../types/wallet-types';
import { OrderType, OrderSide, OrderResponse, OrderParams } from '../types/order-types';
import crypto from 'crypto';
import qs from 'qs';
import { ISymbol } from '../models/symbol-config';
import { IExchangeInfo } from '../types/info-types';


export class ApiHelper extends BaseHttpClient {
    private static _instance:ApiHelper;
    private static _privateInstance:ApiHelper;

    private constructor(privateCall:boolean) {
        super(process.env.API_URI!, privateCall);
    }

    public static getInstance():ApiHelper {
        if(!this._instance) this._instance = new ApiHelper(false);
        return this._instance;
    }

    public static getPrivateInstance():ApiHelper {
        if(!this._privateInstance) this._privateInstance = new ApiHelper(true);
        return this._privateInstance;
    }

    public getLatestCandles(symbol:string, interval='1m', limit=15) {
        return this.instance.get<unknown, CandleType[]>('/klines', {
            params: {
                symbol:symbol, 
                interval:interval,
                limit:limit
            }
        });
    }

    public getWalletInfo() {
        const timeStamp = Date.now();
        const signature = this._generateSignature(qs.stringify({ timestamp:timeStamp }));
        return this.instance.get<unknown, Wallet>('/account', {
            params: { timestamp:timeStamp, signature:signature },
        });
    }

    //MARKET ONLY
    public newOrder(symbol:string, side:OrderSide, type:OrderType, quantity:number) {
        const timestamp = Date.now();
        const params:OrderParams = { symbol, side, type, timestamp };
        params[side === OrderSide.BUY ? 'quoteOrderQty' : 'quantity'] = quantity;

        const signature = this._generateSignature(qs.stringify(params));
        console.log(params);
        return this.instance.post<unknown, OrderResponse>('/order', null, {
            params: {...params, signature},
        });
    }

    public getExchangeInfo(symbols:ISymbol[]) {
        const symbolsList = symbols.map(coin => coin.symbol + coin.stable);
        console.log(`Getting excange info for symbols ${symbolsList}`);
        return this.instance.get<unknown, IExchangeInfo>('/exchangeInfo', {
            params: { symbols:JSON.stringify(symbolsList) },
        });
    }


    private _generateSignature(data?:string):string {
        const signature = crypto.createHmac('sha256', process.env.API_SECRET_KEY!);
        if(data) signature.update(data);
        return signature.digest('hex');
    }
}