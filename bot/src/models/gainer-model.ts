import { MM } from "../libs/mms";
import { CandleType } from "../types/candle-types";
import { CandleBase } from "./candle-base";

export interface iGainer {
    symbol: string;             //"BNBBUSD";
    priceChange: string         //"-1.50000000";
    priceChangePercent: string; //"-0.512";
    weightedAvgPrice: string;   //"287.80354521";
    prevClosePrice: string;     //"293.10000000";
    lastPrice: string;          //"291.50000000";
    lastQty: string;            //"2.99000000";
    bidPrice: string;           //"291.50000000";
    bidQty: string;             //"0.62000000";
    askPrice: string;           //"291.60000000";
    askQty: string;             //"2.61000000";
    openPrice: string;          //"293.00000000";
    highPrice: string;          //"735.30000000";
    lowPrice: string;           //"76.10000000";
    volume: string;             //"10763.65000000";
    quoteVolume: string;        //"3097816.62940000";
    openTime: number;           //1662953145229;
    closeTime: number;          //1663039545229;
    firstId: number;            //30248;
    lastId: number;             //35911;
    count: number;              //566;
}


//this class needs to return the
// - symbol
// - symbol mms
// - symbol mme
// - symbol rsi
// - symbol latest close price
// - symbol latest close time
//an the operations are
// - initialize the candles list
// - calculates the symbol mms
// - calculates the symbol mme
// - calculates the symbol rsi
// - keep the candles list updated
export class Gainer {
    private _symbol:string;
    private _priceChangePercent:number;
    private _candles:CandleBase[];
    private _MMS:number;
    private _MME:number;
    private _lastMMS:number;
    private _lastMME:number;
    private _differenceMM:number;
    private _differenceRateMM:number;

    public constructor(data:iGainer) {
        this._candles = [];
        this._symbol = data.symbol;
        this._priceChangePercent = parseFloat(data.priceChangePercent)
        this._lastMME = 0;
        this._lastMMS = 0;
    }

    public get getPriceChangePercent():number {
        return this._priceChangePercent;
    }

    public get symbol(): string {
        return this._symbol;
    }
    
    public get mms(): number {
        return this._MMS;
    }

    public get mme(): number {
        return this._MME;
    }

    public get mmDifference(): number {
        return this._differenceMM;
    }

    public get mmDifferenceRate(): number {
        return this._differenceRateMM;
    }

    public initializeCandles(candles:CandleType[]): Promise<Gainer> {
        candles.forEach((candle:CandleType, index:number) => {
            const lastClosePrice = index === 0 ? 0 : parseFloat(candles[index - 1][4] as string);
            const currentCandle = new CandleBase(candle, lastClosePrice, this._symbol);
            this._candles.push(currentCandle);
        });

        this._calculateMM();

        return new Promise<Gainer>( resolve => resolve(this));
    }

    public updateCandle(candle:CandleBase): Promise<Gainer> {
        if(this._candles.length > 15) this._candles.shift();    // if has more than 15 candles remove one
        this._candles.push(candle);
        
        this._lastMME = this._MME;
        this._lastMMS = this._MMS;
        this._calculateMM();
        return new Promise<Gainer>(resolve => resolve(this));
    }

    private _calculateMM() {
        const mobileAvarege = new MM(this._candles);
        this._MMS = mobileAvarege.mmSimple;
        this._MME = mobileAvarege.mmExponential;
        this._differenceMM = mobileAvarege.mmDifference;
        this._differenceRateMM = mobileAvarege.mmDifferenceRate;
    }

}

