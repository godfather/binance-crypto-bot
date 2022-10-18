import { ICalculation } from "./ICalculation";

export class MMSCalculation implements ICalculation {
    public values: number[];
    
    public addValues(values: number[]): void {
        if(values) this.values = values;
    }

    public calc(): number {
        return this.values.reduce((total, current) => total + current, 0) / this.values.length;
    }
}
