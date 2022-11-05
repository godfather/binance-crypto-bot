import { ApiHelper } from "../api/api";
import { CalculationFacade } from "../libs/calculations/CalculationFacade";
import { Candle } from "./Candle";
import { IKline, ISocketKline } from "./iKline";

export class Symbol {
    private _candles: Candle[];
    private _mms: number;
    private _mme: number;
    private _defaultKlineLimit: number;

    public static build = async (symbol:string, volume:number, priceChangePercent:number): Promise<Symbol> => {
        const newSymbol = new Symbol(symbol, volume, priceChangePercent);
        await newSymbol._getKlines();
        return newSymbol;
    }

    public get candlesSize(): number {
        return this._candles.length;
    }

    public get mms(): number {
        return this._mms;
    }

    public get mme(): number {
        return this._mme;
    }

    public get openTime(): number {
        return this._candles[this.candlesSize - 1].openTime;
    }

    public calculateMMS(range:number): number {
        const values = this._candles.map(candle => candle.closePrice);
        this._mms = CalculationFacade.mms(values, range).calc();
        console.log(this.mms);
        return this.mms;
    }

    public calculateMME(range:number): number {
        const values = this._candles.map(candle => candle.closePrice);
        this._mme = CalculationFacade.mme(values, range).calc();
        console.log(this.mme);
        return this.mme;
    }

    public updateCandles(kline:ISocketKline|IKline) {
        const candle = new Candle(kline, this.symbol);
        if(this._candles.length === this._defaultKlineLimit) this._candles.shift();
        this._candles.push(candle);
    }

    private constructor(
        public symbol:string, 
        public volume:number, 
        public priceChangePercent:number) {
            this._defaultKlineLimit = 25;
    }

    private async _getKlines() {
        const klines = await ApiHelper.getInstance().getLatestKlines(this.symbol, '1m', this._defaultKlineLimit);
        this._candles = klines.map(kline => new Candle(kline, this.symbol));
    }

}