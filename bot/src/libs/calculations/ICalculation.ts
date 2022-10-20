export interface ICalculation {
    values:number[];
    addValues(values:number[]):void;
    calc(range:number):number;
}