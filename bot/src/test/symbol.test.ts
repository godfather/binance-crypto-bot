import { expect, describe, test, jest } from '@jest/globals';
import { ISocketKline } from '../models/iKline';

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

    test('testing updating symbols candles', async () => {
        const testKline:ISocketKline = {
            stream:'test',
            data: {
                "e": "kline",     // Event type
                "E": 123456789,   // Event time
                "s": "BNBUSDT",    // Symbol
                "k": {
                    "t": 123400000, // Kline start time
                    "T": 123460000, // Kline close time
                    "s": "BNBBTC",  // Symbol
                    "i": "1m",      // Interval
                    "f": 100,       // First trade ID
                    "L": 200,       // Last trade ID
                    "o": "0.0010",  // Open price
                    "c": "0.0020",  // Close price
                    "h": "0.0025",  // High price
                    "l": "0.0015",  // Low price
                    "v": "1000",    // Base asset volume
                    "n": 100,       // Number of trades
                    "x": false,     // Is this kline closed?
                    "q": "1.0000",  // Quote asset volume
                    "V": "500",     // Taker buy base asset volume
                    "Q": "0.500",   // Taker buy quote asset volume
                    "B": "123456"   // Ignore
                }
            }
        };

        expect.assertions(2);

        const symbol = await Symbol.build('BNBUSDT', 300, 1.2);
        symbol.updateCandles(testKline);
        expect(symbol.candles[symbol.candles.length - 1].closePrice).toEqual(0.0020);
        expect(symbol.candlesSize).toEqual(25);
    });
});