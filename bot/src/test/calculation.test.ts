import { MMSCalculation } from "../libs/calculations/MMSCalculation";
import { test, describe, expect } from '@jest/globals';

//test values


describe('testing mms class', () => {
    const testValues = [5, 7, 8, 4]; //values to test
    
    test('test the mms values are setted', () => {
        const mms = new MMSCalculation(); //MMSCalculation instance
        mms.addValues(testValues);
        expect(mms.values).toEqual(testValues);
    });

    test('test the mms calc', () => {
        const mms = new MMSCalculation(); //MMSCalculation instance
        mms.addValues(testValues);
        const result = mms.calc();
        expect(result).toEqual(6);
    });

})
