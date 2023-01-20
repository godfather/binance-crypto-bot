import { ICalculation } from "./ICalculation";
import { AverageCalculation } from "./AverageCalculation";
import { CalculationFacade } from "./CalculationFacade";
import { Observable } from "../observer/Observable";
import { Candle } from "../../models/Candle";
import { MMSCalculation } from "./MMSCalculation";


interface ADXBaseObject {
    high: number;
    low: number;
    close: number;
}

export class ADXCalculation {
    private _candles: Observable<Candle[]>;
    private _range: number;

    constructor() {
        this._candles = new Observable<Candle[]>();
        this._observers();
    }

    public get values() {
        return this._candles.value.map(candle => {
            return {
                openTime: candle.openTime,
                high: candle.highPrice,
                low: candle.lowPrice,
                close: candle.closePrice,
                trueRange: candle.trueRange,
                positiveDI: candle.positiveDI,
                negativeDI: candle.negativeDI,
                dx: candle.DX,
                adx: candle.ADX,
                positiveDM: candle.positiveDM,
                negatibeDM: candle.negativeDM,
                smoothPosDM: candle.smoothedPositiveDM,
                smoothNegDM: candle.smoothedNegativeDM,
                smoothTrueRange: candle.smoothedTrueRange
            };
        });
    }


    public addCandles(candles: Candle[]): ADXCalculation {
        if(candles) this._candles.value = candles;
        return this;
    }

    public addRange(range: number): ADXCalculation {
        if(range) this._range = range;
        return this;
    }

    private _observers() {
        this._candles.subscribe(candles => {
            let sumTrueRange = 0;
            let sumPositeveDM = 0;
            let sumNegativeDM = 0;
            let mms: ICalculation;

            candles.forEach((candle, i, candles) => {
                if(i === 0) return;
                
                const currentCandle = this._prepareData(candle);
                const prevCandle = this._prepareData(candles[i - 1]);

                candle.trueRange = this._calcTrueRange(currentCandle, prevCandle);
                candle.positiveDM = this._calcPositiveDM(currentCandle, prevCandle);
                candle.negativeDM = this._calcNegativeDM(currentCandle, prevCandle);



                if(i <= this._range) {
                    sumPositeveDM += candle.positiveDM;
                    sumNegativeDM += candle.negativeDM
                    sumTrueRange += candle.trueRange;

                    candle.smoothedPositiveDM = sumPositeveDM;
                    candle.smoothedNegativeDM = sumNegativeDM;
                    candle.smoothedTrueRange = sumTrueRange;
                } else {
                    candle.smoothedPositiveDM = candles[i - 1].smoothedPositiveDM - (candles[i - 1].smoothedPositiveDM / this._range) + candle.positiveDM;
                    candle.smoothedNegativeDM = candles[i - 1].smoothedNegativeDM - (candles[i - 1].smoothedNegativeDM / this._range) + candle.negativeDM;
                    candle.smoothedTrueRange = candles[i - 1].smoothedTrueRange - (candles[i - 1].smoothedTrueRange / this._range) + candle.trueRange;
                }

                if(i > ((this._range * 2) - 1)) {
                    if(!mms) {
                        mms = CalculationFacade.mms(candles.slice(this._range, (this._range * 2)).map(c => c.DX), this._range);
                        candle.ADX = mms.calc();
                    } else candle.ADX = mms.update(candle.DX);
                } else candle.ADX = 0;
            });

        });
    }

    private _calcTrueRange(currentCandleData: ADXBaseObject, prevCandleData: ADXBaseObject): number {
        return Math.max(
            currentCandleData.high - currentCandleData.low,
            Math.abs(currentCandleData.high - prevCandleData.close),
            Math.abs(currentCandleData.low - prevCandleData.close)
        );
    }

    private _calcPositiveDM(currentCandleData: ADXBaseObject, prevCandleData: ADXBaseObject): number {
        const diff = currentCandleData.high - prevCandleData.high;
        if(diff > (prevCandleData.low - currentCandleData.low) && diff > 0) {
            return diff;
        }

        return 0;
    }

    private _calcNegativeDM(currentCandleData: ADXBaseObject, prevCandleData: ADXBaseObject): number {
        const diff = prevCandleData.low - currentCandleData.low;
        if(diff > (currentCandleData.high - prevCandleData.high) && diff > 0) {
            return diff;
        }

        return 0;
    }

    private _prepareData(candle: Candle): ADXBaseObject {
        return {
            high: candle.highPrice,
            low: candle.lowPrice,
            close: candle.closePrice,            
        };
    }
}
