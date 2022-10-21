export interface ICalculation {
    values: number[];
    addRange(range:number): ICalculation;
    addValues(values:number[]): ICalculation;
    calc(): number;
    update(newValue:number): number;
}