import { CandleBase } from "../models/candle-base";

//SOCKET KLINE TYPE
export interface KCandle {
    t:number;  // Kline start time
    T:number;  // Kline close time
    s:string;  // Symbol
    i:string;  // Interval
    f:number;  // First trade ID
    L:number;  // Last trade ID
    o:string;  // Open price
    c:string;  // Close price
    h:string;  // High price
    l:string;  // Low price
    v:string;  // Base asset volume
    n:number;  // Number of trades
    x:boolean; // Is this kline closed?
    q:string;  // Quote asset volume
    V:string;  // Taker buy base asset volume
    Q:string;  // Taker buy quote asset volume
    B:string;  // Ignore
}

// export interface KlineCandle {
//     e:string; // Event type
//     E:number; // Event time
//     s:string; // Symbol
//     k: KCandle;
// }

export interface KlineCandle {
    stream:string;
    data: {
        e:string; // Event type
        E:number; // Event time
        s:string; // Symbol
        k: KCandle;
    };
}


//REST CANDLE
export type CandleType = (string|number)[];


//BOT CANDLE COLLECTION
export interface CandleCollection {
    symbol:string;
    candles:CandleBase[];
}

export interface CandlePrice {
    symbol:string;
    price:number;
}

export interface CandleStartTime {
    symbol:string;
    timestamp:number;
}