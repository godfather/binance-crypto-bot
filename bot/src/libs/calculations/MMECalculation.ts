import { ICalculation } from "./ICalculation";

export class MMECalculation implements ICalculation {
    public values: number[];
    public lastMME: number;
    private _mmeValues: number[];
    private _range:number;

    constructor() {
        this.values = [];
        this._mmeValues = [];
    }

    public get exponentialWeight(): number {
        return this._calcExponentialWeight();
    }

    public get currentMME(): number {
        return this._mmeValues[this._mmeValues.length -1];
    }

    public addRange(range:number): ICalculation {
        this._range = range;
        return this;
    }

    public addValues(values: number[]): ICalculation {
        this.values = values;
        return this;
    }
    
    public calc(): number {
        this._mmeValues = [(this.lastMME || this.values[this._range])];

        this.values.slice(this._range).forEach((value, _) => {
            this.lastMME = this._calcExponentialAverage(value);
            this._mmeValues.push(this.lastMME);
        });

        return this.currentMME;
    }

    public update(newValue:number): number {
        this.values.shift();
        this.values.push(newValue);

        this.lastMME = this._calcExponentialAverage(newValue);
        this._mmeValues.shift();
        this._mmeValues.push(this.lastMME);
        return this.currentMME;
    }

    private _calcExponentialWeight():number {
        return 2 / (this._range + 1);
    }

    private _calcExponentialAverage(value:number): number {
        return (value * this.exponentialWeight) + (this.lastMME * (1 - this.exponentialWeight))
    }
    
}