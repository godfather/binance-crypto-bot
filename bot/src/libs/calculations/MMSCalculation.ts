import { ICalculation } from "./ICalculation";
import { AverageCalculation } from "./AverageCalculation";

export class MMSCalculation implements ICalculation {
    public values: number[];
    private _mmsValues: number[];
    private _range: number;
    private _avg: AverageCalculation;
    
    constructor() {
        this._mmsValues = [];
        this._avg = new AverageCalculation();
    }

    public get currentMMS(): number {
        return this._mmsValues[this._mmsValues.length -1]; 
    }

    public addValues(values: number[]): ICalculation {
        if(values) this.values = values;
        return this;
    }

    public addRange(range: number): ICalculation {
        this._range = range;
        return this;
    }

    public calc(): number {
        
        if(!this._range) throw Error('MMS range is empty!');
        else if(this._range > this.values.length) throw Error('MMS range is greater than dataset!');

        for(let i = 0; (i + this._range - 1) < this.values.length; i++) {
            this._mmsValues.push(this._avg.addValues(this.values.slice(i, i + this._range)).calc());
        }

        // console.table(this._mmsValues);

        return this.currentMMS;
    }

    public update(newValue:number) :number {
        this.values.shift();
        this.values.push(newValue);
        return this.calc();
    }
}
