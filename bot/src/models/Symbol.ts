import { ApiHelper } from "../api/api";
import { CalculationFacade } from "../libs/calculations/CalculationFacade";
import { Observable } from "../libs/observer/Observable";
import { Candle } from "./Candle";
import { IKline, ISocketKline } from "./iKline";

export class Symbol {
    private _candles: Observable<Candle[]> = new Observable<Candle[]>();
    private _mms: number;
    private _mme: number;
    private _defaultKlineLimit: number;

    //observable variables
    private _updateMetrics: Observable<boolean> = new Observable<boolean>();

    public static build = async (symbol:string, volume:number, priceChangePercent:number): Promise<Symbol> => {
        const newSymbol = new Symbol(symbol, volume, priceChangePercent);
        await newSymbol._getKlines();
        return newSymbol;
    }

    public get candles(): Candle[] {
        return this._candles.value;
    }

    public get candlesSize(): number {
        return this._candles.value.length;
    }

    public get mms(): number {
        return this._mms;
    }

    public get mme(): number {
        return this._mme;
    }

    public get openTime(): number {
        return this._candles.value[this.candlesSize - 1].openTime;
    }

    public calculateMMS(range:number): number {
        const values = this._candles.value.map(candle => candle.closePrice);
        this._mms = CalculationFacade.mms(values, range).calc();
        // console.log(this.mms);
        return this.mms;
    }

    public calculateMME(range:number): number {
        const values = this._candles.value.map(candle => candle.closePrice);
        this._mme = CalculationFacade.mme(values, range).calc();
        // console.log(this.mme);
        return this.mme;
    }

    public updateCandles(kline:ISocketKline|IKline) {
        const candle = new Candle(kline, this.symbol);
        if(this._candles.value.length === this._defaultKlineLimit) this._candles.value.shift();
        this._candles.value.push(candle);
        this._candles.value = this._candles.value;
    }

    private constructor(
        public symbol:string, 
        public volume:number, 
        public priceChangePercent:number) {
            this._defaultKlineLimit = 25;
            this._updateMetrics.value = false;
            this._observers();
    }

    private async _getKlines() {
        const klines = await ApiHelper.getInstance().getLatestKlines(this.symbol, '1m', this._defaultKlineLimit);
        this._candles.value = klines.map(kline => new Candle(kline, this.symbol));
    }

    private _observers() {
        this._candles.subscribe(_ => {
            console.log('candles changed');
            // console.table(candles);
        });
    }

}