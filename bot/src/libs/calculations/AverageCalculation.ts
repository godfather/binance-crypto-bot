import { ICalculation } from "./ICalculation";

export class AverageCalculation implements ICalculation {
    public values: number[];
    private _simpleAverage: number;
    private _range: number;
    
    public get simpleAverage(): number {
        return this._simpleAverage;
    }


    addRange(range: number): ICalculation {
        this._range = range;
        return this;
    }
    
    addValues(values: number[]): ICalculation {
        this.values = values.filter(value => value !== undefined);
        return this;
    }
    
    calc(): number {
        let division = this._range && this._range <= this.values.length ? this._range : this.values.length;

        this._simpleAverage = this.values.reduce((total, current) => total + current, 0) / division;
        return this.simpleAverage;
    }
    
    update(newValue: number): number {
        this.values.push(newValue);
        return this.calc();
    }
    
}