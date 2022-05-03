import 'dotenv/config';
import { BaseHttpClient } from "./base-http-client";
import { CandleType } from "../types/candle-types";
import { Wallet } from '../types/wallet-types';
import { OrderType, OrderSide, OrderResponse } from '../types/order-types';
import crypto from 'crypto';
import qs from 'qs';


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

    //MAKET ONLY
    public newOrder(symbol:string, side:OrderSide, type:OrderType, quantity:number) {

        // console.log(process.env.API_SECRET_KEY);
        // console.log(process.env.API_KEY);

        const timestamp = Date.now();
        const params = { symbol, side, type, quantity, timestamp };
        const signature = this._generateSignature(qs.stringify(params));
        // console.log(params);
        return this.instance.post<unknown, OrderResponse>('/order', null, {
            params: {...params, signature},
        });
    }


    private _generateSignature(data?:string):string {
        const signature = crypto.createHmac('sha256', process.env.API_SECRET_KEY!);
        if(data) signature.update(data);
        return signature.digest('hex');
    }
}