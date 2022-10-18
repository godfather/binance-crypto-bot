export interface ICalculation {
    values:number[];
    addValues(values:number[]):void;
    calc():number;
}