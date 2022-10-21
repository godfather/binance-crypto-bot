import { ICalculation } from "./ICalculation";

export class AverageCalculation implements ICalculation {
    public values: number[];
    private _simpleAverage: number;
    
    public get simpleAverage(): number {
        return this._simpleAverage;
    }


    addRange(range: number): ICalculation {
        range;
        throw new Error("Method not implemented.");
    }
    
    addValues(values: number[]): ICalculation {
        this.values = values;
        return this;
    }
    
    calc(): number {
        this._simpleAverage = this.values.reduce((total, current) => total + current, 0) / this.values.length;
        return this.simpleAverage;
    }
    
    update(newValue: number): number {
        this.values.push(newValue);
        return this.calc();
    }
    
}