import { expect, describe, test, jest } from '@jest/globals';

import { Symbol } from '../models/Symbol';

jest.setTimeout(10000);

describe('Testing the symbol class\' methods', () => {

    test('testing symbol creation', async () => {
        const symbol = await Symbol.build('BNBUSDT', 300, 1.2);
        expect(symbol.candlesSize).toEqual(25);
    });

    test('testing symbol mms calc', async () => {
        const symbol = await Symbol.build('BNBUSDT', 300, 1.2);
        const mms = symbol.calculateMMS(7);
        expect(mms > 0).toEqual(true);        
    });

    test('testing symbol mme calc', async () => {
        const symbol = await Symbol.build('BNBUSDT', 300, 1.2);
        const mme = symbol.calculateMME(7);
        expect(mme > 0).toEqual(true);        
    });
});