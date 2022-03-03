import 'dotenv/config';
import { BaseHttpClient } from "./base-http-client";
import { CandleType } from "../types/candle-types";

export class ApiHelper extends BaseHttpClient {

    private static _instance:ApiHelper;

    private constructor() {
        super(process.env.API_URI!);
    }

    public static getInstance():ApiHelper {
        if(!this._instance) this._instance = new ApiHelper();
        return this._instance;
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

    public sellAsset():void {

    }
}