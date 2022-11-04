import { expect, describe, test } from '@jest/globals';

import { Symbol } from '../models/Symbol';

describe('Testing the symbol class\' methods', () => {

    test('testing symbol creation', async () => {
        const symbol = await Symbol.build('BNBUSDT', 300, 1.2);
        expect(symbol.klinesSize).toEqual(25);
    });
});