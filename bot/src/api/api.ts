import 'dotenv/config';
import { BaseHttpClient } from "./base-http-client";
import crypto from 'crypto';
import qs from 'qs';

//importing interfaces
import { IWallet } from '../models/iWallet';
import { IGainer } from '../models/iGainer';
import { IKline } from '../models/iKline';
import { IExchangeInfo } from '../models/iExchangeInfo';

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

    public getLatestKlines(symbol:string, interval='1m', limit=15) {
        return this.instance.get<unknown, IKline[]>('/klines', {
            params: {
                symbol:symbol, 
                interval:interval,
                limit:limit
            }
        });
    }

    public getWalletInfo(): Promise<IWallet> {
        const timeStamp = Date.now();
        const signature = this._generateSignature(qs.stringify({ timestamp:timeStamp }));
        return this.instance.get<unknown, IWallet>('/account', {
            params: { timestamp:timeStamp, signature:signature },
        });
    }

    public getGainers() {
        return this.instance.get<unknown, IGainer[]>('/ticker/24hr');
    }

//     //MARKET ONLY
//     public newOrder(symbol:string, side:OrderSide, type:OrderType, quantity:number) {
//         const timestamp = Date.now();
//         const params:OrderParams = { symbol, side, type, timestamp };
//         params[side === OrderSide.BUY ? 'quoteOrderQty' : 'quantity'] = quantity;

//         const signature = this._generateSignature(qs.stringify(params));
//         console.log(params);
//         return this.instance.post<unknown, OrderResponse>('/order', null, {
//             params: {...params, signature},
//         });
//     }

    public getExchangeInfo(symbols:string[]) {
        return this.instance.get<unknown, IExchangeInfo>('/exchangeInfo', {
            params: { symbols:JSON.stringify(symbols) },
        });
    }


    private _generateSignature(data?:string):string {
        const signature = crypto.createHmac('sha256', process.env.API_SECRET_KEY!);
        if(data) signature.update(data);
        return signature.digest('hex');
    }
}