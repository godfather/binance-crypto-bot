import { IStrategy, IStrategyDefinition, StrategyCallback } from "./IStrategy";
import EventEmitter from "events";
import { OrderSide } from "../../models/iOrder";

type mmeStrategy = {
    type: string;
    data: {
        range: number;
        mmeFast: number;
        mmeSlow: number; 
    };
}

export class MobileAverageStrategy implements IStrategy {
    private _params: IStrategyDefinition;

    public constructor(
        public eventEmmiter: EventEmitter,
        public buyCallback: StrategyCallback,
        public sellCallback: StrategyCallback
    ) {
        this.eventEmmiter.on(OrderSide.BUY, this.buyCallback);
        this.eventEmmiter.on(OrderSide.SELL, this.sellCallback);
    }

    public setParams(params: mmeStrategy): MobileAverageStrategy {
        this._params = params;
        return this;
    }
        
    public runTrigger(): void {
        if(this._params.data.mmeFast > this._params.data.mmeSlow) this.eventEmmiter.emit(OrderSide.BUY);
        else if(this._params.data.mmeFast < this._params.data.mmeSlow) this.eventEmmiter.emit(OrderSide.SELL);
    }

    public destroy(): void {
        this.eventEmmiter.removeListener(OrderSide.BUY, this.buyCallback);
        this.eventEmmiter.removeListener(OrderSide.SELL, this.sellCallback);
    }
}