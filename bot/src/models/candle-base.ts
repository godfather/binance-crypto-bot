import { CandleType, KlineCandle } from "../types/candle-types";

export class CandleBase {
    private _closePrice:number;
    private _openTimeMS:number; //Kline Open time
    private _closeRate:number;
    private _currentClosePrice:string;
    private _priceDifference:string;

    public constructor(data:CandleType|KlineCandle, prevClosePrice?:number) {
        this._isKline(data) ? this._processKline(data) : this._processRestCandle(data);
        this._closeRate = this._calcCloseRate(prevClosePrice ||= 0);
        this._currentClosePrice = 'USD$ ' + this._closePrice.toFixed(2);
        this._priceDifference = this._calcPriceDifference(prevClosePrice);
    }

    get closePrice():number {
        return this._closePrice;
    }

    get openTimeMS():number {
        return this._openTimeMS;
    }


    private _calcCloseRate(prevClosePrice:number):number {
        if(this._closePrice > prevClosePrice) return ((this._closePrice - prevClosePrice) * 100) / prevClosePrice;
        return ((this._closePrice * 100) / prevClosePrice) - 100;
    }

    private _calcPriceDifference(prevClosePrice:number):string {
        if(prevClosePrice === 0) prevClosePrice = this._closePrice;
        return 'USD$ ' + (this._closePrice - prevClosePrice).toFixed(2);
    }

    private _processKline(data:KlineCandle):void {
        this._openTimeMS = data.k.t;
        this._closePrice = parseFloat(data.k.c);
    }

    private _processRestCandle(data:CandleType):void {
        this._openTimeMS = data[0] as number;
        this._closePrice = parseFloat(data[4] as string);
    }

    private _isKline(data:CandleType|KlineCandle): data is KlineCandle {
        return (data as KlineCandle).s !== undefined;
    }
}