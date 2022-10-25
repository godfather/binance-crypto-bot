import { MMSCalculation } from "./MMSCalculation";
import { MMECalculation } from "./MMECalculation";
import { RSICalculation } from "./RSICalculation";
import { AverageCalculation } from "./AverageCalculation";
import { ICalculation } from "./ICalculation";


export abstract class CalculationFacade {
    public static mms(values: number[], range: number): ICalculation {
        const mms = new MMSCalculation();
        return mms.addValues(values).addRange(range);
    }

    public static mme(values: number[], range: number): ICalculation {
        const mme = new MMECalculation();
        const mms = new MMSCalculation();

        mme.lastMME = mms.addValues(values.slice(0,range)).addRange(range).calc();
        return mme.addValues(values).addRange(range);
    }

    public static avg(values: number[], range?: number): ICalculation {
        const avg = new AverageCalculation();
        if(range) avg.addRange(range);
        return avg.addValues(values);
    }

    public static rsi(values: number[], range: number): ICalculation {
        const rsi = new RSICalculation();
        return rsi.addValues(values).addRange(range);
    }
}