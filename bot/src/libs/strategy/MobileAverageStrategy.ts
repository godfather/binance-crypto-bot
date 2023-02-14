import { IStrategy, IStrategyDefinition, StrategyCallback, EnumStrategyResponse } from "./IStrategy";
// import EventEmitter from "events";
import { CalculationFacade } from "../calculations/CalculationFacade";
import { Observable } from "../observer/Observable";
import { Wallet } from "../../models/Wallet";
import { Candle } from "../../models/Candle";

interface mmeStrategy extends IStrategyDefinition {
    type: string;
    data: {
        fastRange: number;
        slowRange: number;
        longRange: number;
    };
}

export class MobileAverageStrategy implements IStrategy {
    private _params: IStrategyDefinition;
    private _fastEMA: number;
    private _slowEMA: number;
    private _longEMA: number;
    private _closePrices: number[];
    private _candles: Candle[];
    private _symbol: string;

    public constructor() {}

    public setParams(params: mmeStrategy): MobileAverageStrategy {
        this._params = params;
        return this;
    }

    public runTrigger(candles: Candle[], round: number, stop:number, target: number, holding: boolean): EnumStrategyResponse {
        if(round < 3) {
            // console.log('EnumStrategyResponse.WAIT');
            // return EnumStrategyResponse.WAIT;
        }

        this._candles = candles;
        this._symbol = this._candles[0].symbol;

        if(this._candles[this._candles.length -1].closePrice <= stop && holding) return EnumStrategyResponse.SELL;

        this._closePrices = this._candles.map(candle => candle.closePrice);
        this._doCalculations(this._candles);

        const latestCandle = this._candles[this._candles.length -1];
        const lastClosePrice = this._closePrices[this._closePrices.length - 2];
        const currentClosePrice = this._closePrices[this._closePrices.length - 1];

        console.log(`${this._symbol} FAST: ${this._fastEMA}  SLOW ${this._slowEMA}  LONG ${this._longEMA}`);
        console.log(`${this._symbol} +DI: ${latestCandle.positiveDI}  -DI ${latestCandle.negativeDI}  ADX ${latestCandle.ADX}`);

        if(holding) {
            if(currentClosePrice >= target) return EnumStrategyResponse.SELL;
            return EnumStrategyResponse.WAIT;
        }

        if(this._fastEMA > this._slowEMA && 
           this._slowEMA > this._longEMA &&
           latestCandle.ADX > 25 &&
           latestCandle.positiveDI > (latestCandle.negativeDI + 5) &&
           (latestCandle.closePrice < target && latestCandle.closePrice > stop)
        //    (latestCandle.lowPrice < this._fastEMA && latestCandle.lowPrice > this._slowEMA)) {
        ) {

            
            // if(currentClosePrice < lastClosePrice) {
            //     console.log(`SELLING CCP ${currentClosePrice} < LCP ${lastClosePrice}`);
            //     return EnumStrategyResponse.SELL;
            // } 

            // if(round > 0 && currentClosePrice >= target) {
            //     console.log(`SELLING ON THIRD ROUND CCP ${currentClosePrice} | TP ${target}`);
            //     return EnumStrategyResponse.SELL;
            // }

            if(!Wallet.getInstance().hasFounds) {
                console.log('Wallet has no found :(');
                return EnumStrategyResponse.WAIT;
            }    

            return EnumStrategyResponse.BUY;
        }
        
        return EnumStrategyResponse.WAIT;
    }

    //update it to receive the last ema calculated;
    private _doCalculations(candles: Candle[]): void {
        this._fastEMA = CalculationFacade.mme(this._closePrices, this._params.data.fastRange).calc();
        this._slowEMA = CalculationFacade.mme(this._closePrices, this._params.data.slowRange).calc();
        this._longEMA = CalculationFacade.mme(this._closePrices, this._params.data.longRange).calc();
        const adx = CalculationFacade.adx(candles, 14);
        this._candles = candles;

        // console.table(adx.values);
    }
}