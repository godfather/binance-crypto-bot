import { EventEmitter } from 'events';
import { Candle } from '../../models/Candle';

export interface IStrategyDefinition {
    type:string;
    data:any;
}

export type StrategyCallback = () => void;

export enum EnumStrategyResponse {
    BUY, 
    SELL, 
    WAIT
}

export interface IStrategy {
    // eventEmmiter: EventEmitter;
    // buyCallback: StrategyCallback;
    // sellCallback: StrategyCallback;
    setParams(params: IStrategyDefinition): void;
    runTrigger(candles: Candle[], round: number, stop: number, target: number, holding: boolean): EnumStrategyResponse;
    // destroy(): void;
}