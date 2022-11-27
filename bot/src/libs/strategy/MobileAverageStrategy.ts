import { IStrategy, IStrategyDefinition, StrategyCallback, EnumStrategyResponse } from "./IStrategy";
// import EventEmitter from "events";
import { CalculationFacade } from "../calculations/CalculationFacade";
import { Observable } from "../observer/Observable";

interface mmeStrategy extends IStrategyDefinition {
    type: string;
    data: {
        fastRange: number;
        slowRange: number;
    };
}

export class MobileAverageStrategy implements IStrategy {
    private _params: IStrategyDefinition;
    private _fastEMA: number;
    private _slowEMA: number;
    private _values: number[];

    public constructor() {}

    public setParams(params: mmeStrategy): MobileAverageStrategy {
        this._params = params;
        return this;
    }

    public runTrigger(values: number[]): EnumStrategyResponse {
        this._values = values;
        this._calculateEMA();

        if(this._fastEMA > this._slowEMA) return EnumStrategyResponse.BUY;
        else if(this._fastEMA < this._slowEMA) return EnumStrategyResponse.SELL;
        return EnumStrategyResponse.WAIT;
    }

    private _calculateEMA(): void {
        this._fastEMA = CalculationFacade.mme(this._values, this._params.data.fastRange).calc();
        this._slowEMA = CalculationFacade.mme(this._values, this._params.data.slowRange).calc();
        // console.table([this._fastEMA, this._slowEMA]);
    }
}