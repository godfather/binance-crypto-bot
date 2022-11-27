import { IStrategy, IStrategyDefinition } from "./IStrategy";
import { MobileAverageStrategy } from "./MobileAverageStrategy";

export class StrategyFactory {
    public static TYPE_EMA = 'ema'; //exponential mobile average;

    private constructor() {}

    public static build(deinifition: IStrategyDefinition) {
        let strategy: IStrategy;

        switch(deinifition.type) {
            case this.TYPE_EMA:
                strategy = new  MobileAverageStrategy();
                strategy.setParams(deinifition);
                break;
            default:
                throw new Error('stategy type undefined or not exists');
        }

        return strategy;
    }
}