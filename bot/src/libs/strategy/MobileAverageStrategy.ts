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

    public constructor() {}

    public setParams(params: mmeStrategy): MobileAverageStrategy {
        this._params = params;
        return this;
    }

    public runTrigger(candles: Candle[], round: number, stop:number, target: number, holding: boolean): EnumStrategyResponse {
        // if(round < 3) {
        //     console.log('EnumStrategyResponse.WAIT');
        //     return EnumStrategyResponse.WAIT;
        // }

        this._closePrices = candles.map(candle => candle.closePrice);
        this._calculateEMA();

        console.log(`FAST: ${this._fastEMA}  SLOW ${this._slowEMA}  LONG ${this._longEMA}`);

        if(this._fastEMA > this._slowEMA && this._slowEMA > this._longEMA) {
            const lastClosePrice = this._closePrices[this._closePrices.length - 2];
            const currentClosePrice = this._closePrices[this._closePrices.length - 1];
            
            if(currentClosePrice < lastClosePrice) {
                console.log(`SELLING CCP ${currentClosePrice} < LCP ${lastClosePrice}`);
                return EnumStrategyResponse.SELL;
            } 

            if(round > 0 && currentClosePrice >= target) {
                console.log(`SELLING ON THIRD ROUND CCP ${currentClosePrice} | TP ${target}`);
                return EnumStrategyResponse.SELL;
            }

            if(!Wallet.getInstance().hasFounds) {
                console.log('EnumStrategyResponse.WAIT');
                return EnumStrategyResponse.WAIT;
            }    

            return EnumStrategyResponse.BUY;
        } else if(this._fastEMA < this._slowEMA) return EnumStrategyResponse.SELL;
        return EnumStrategyResponse.WAIT;
    }

    //update it to receive the last ema calculated;
    private _calculateEMA(): void {
        this._fastEMA = CalculationFacade.mme(this._closePrices, this._params.data.fastRange).calc();
        this._slowEMA = CalculationFacade.mme(this._closePrices, this._params.data.slowRange).calc();
        this._longEMA = CalculationFacade.mme(this._closePrices, this._params.data.longRange).calc();
    }
}