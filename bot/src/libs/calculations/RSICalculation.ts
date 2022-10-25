import { ICalculation } from "./ICalculation";
import { AverageCalculation } from "./AverageCalculation";

class RSIObject {
    constructor(
        public value: number,
        public variation=0,
        public gain=0,
        public loss=0,
        public avGain=0,
        public avLoss=0,
        public rs=0,
        public rsi=0) {};
}

export class RSICalculation implements ICalculation {
    public values: number[];
    private _rsiValues: RSIObject[];
    private _range: number;

    constructor() {
        this._rsiValues = [];
        this._range = 14;
    }

    public get currentRSI(): number {
        return this._rsiValues[this._rsiValues.length - 1].rsi;
    };


    public addRange(range: number): ICalculation {
        this._range = range;
        return this;
    }
    
    public addValues(values: number[]): ICalculation {
        this.values = values;
        return this;
    }
    
    public calc(): number {
        if(!this._range) throw Error('MMS range is empty!');
        else if(this._range > this.values.length) throw Error('MMS range is greater than dataset!');
        this._processGainLost();
        return this.currentRSI;
    }

    public update(newValue: number): number {
        newValue
        throw new Error("Method not implemented.");
    }


    private _processGainLost(): void {
        this.values.forEach((value, i) => {
            const rsiObject = new RSIObject(value);
            
            if(i === 0) rsiObject.gain = 0;
            else {
                rsiObject.variation = value - this.values[i - 1];
                if(rsiObject.variation >= 0) rsiObject.gain = rsiObject.variation;
                else rsiObject.loss = rsiObject.variation  * -1;
            }
            
            if(i > 0 && i === this._range) {
                const gainData = this._rsiValues.map(current => current.gain);
                const lossData = this._rsiValues.map(current => current.loss);
                gainData.push(rsiObject.gain);
                lossData.push(rsiObject.loss);
                rsiObject.avGain = this._avgCalc(gainData);
                rsiObject.avLoss = this._avgCalc(lossData);

            } else if(i > this._range) {
                rsiObject.avGain = this._avgCalc(this._rsiValues[this._rsiValues.length - 1].avGain, rsiObject.gain);
                rsiObject.avLoss = this._avgCalc(this._rsiValues[this._rsiValues.length - 1].avLoss, rsiObject.loss);
            }

            if(i >= this._range) {
                rsiObject.rs = rsiObject.avGain / rsiObject.avLoss;
                rsiObject.rsi = 100 - (100 / (1 + rsiObject.rs));
            }

            this._rsiValues.push(rsiObject);
        });
    }


    private _avgCalc(values: number[] | number, newValue?: number): number {
        if(!Array.isArray(values)) return (values * 13 + newValue!) / this._range;

        // console.log(values);
        const avg = new AverageCalculation();
        return avg.addValues((values as number[])).addRange(this._range).calc();
    }
}