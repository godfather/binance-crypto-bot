import { EventEmitter } from 'events';

export interface IStrategyDefinition {
    type:string;
    data:any;
}

export type StrategyCallback = () => void;

export interface IStrategy {
    eventEmmiter: EventEmitter;
    buyCallback: StrategyCallback;
    sellCallback: StrategyCallback;
    setParams(params: IStrategyDefinition): void;
    runTrigger(): void;
    destroy(): void;
}