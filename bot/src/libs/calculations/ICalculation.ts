import { Candle } from "../../models/Candle";

export interface ICalculation {
    values: number[];
    addRange(range:number): ICalculation;
    addCandles?(candles: Candle[]): ICalculation
    addValues(values:number[]): ICalculation;
    calc(): number;
    update(newValue:number): number;
}