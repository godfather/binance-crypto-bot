import 'dotenv/config';
import { BaseHttpClient } from "./base-http-client";
import { CandleType } from "../types/candle-types";

export class ApiHelper extends BaseHttpClient {

    public constructor() {
        super(process.env.API_URI!);
    }

    public getLatestCandles(symbol:string, interval='1m', limit=15) {
        return this.instance.get<CandleType[]>('/klines', {
            params: {
                symbol:symbol, 
                interval:interval,
                limit:limit
            }
        });
    }
}