import { ApiHelper } from "../api/api";
import { Candle } from "./Candle";

export class Symbol {
    private _candles: Candle[];

    public static build = async (symbol:string, volume:number, priceChangePercent:number): Promise<Symbol> => {
        const newSymbol = new Symbol(symbol, volume, priceChangePercent);
        await newSymbol._getKlines();
        return newSymbol;
    }

    public get candlesSize(): number {
        return this._candles.length;
    }

    private constructor(
        public symbol:string, 
        public volume:number, 
        public priceChangePercent:number) {}

    private async _getKlines() {
        const klines = await ApiHelper.getInstance().getLatestKlines(this.symbol, '1m', 25);
        this._candles = klines.map(kline => new Candle(kline, this.symbol));
    }
}