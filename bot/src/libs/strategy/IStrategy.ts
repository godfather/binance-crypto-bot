import { EventEmitter } from 'events';

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
    runTrigger(values:number[], round: number, target: number): EnumStrategyResponse;
    // destroy(): void;
}