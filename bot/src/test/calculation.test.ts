import { MMSCalculation } from "../libs/calculations/MMSCalculation";
import { MMECalculation } from "../libs/calculations/MMECalculation";
import { RSICalculation } from "../libs/calculations/RSICalculation";
import { CalculationFacade } from "../libs/calculations/CalculationFacade";

import { test, describe, expect } from '@jest/globals';
import { ApiHelper } from "../api/api";
import { Candle } from "../models/Candle";
import { ADXCalculation } from "../libs/calculations/ADXCalculation";

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
        const result = mms.addValues(testValues).addRange(3).calc();
        expect(result).toEqual(6.333333333333333);
    });

    test('test mms update', () => {
        const mms = new MMSCalculation(); //MMSCalculation instance
        mms.addValues(testValues).addRange(3).calc();
        const result = mms.update(9); 
        expect(result).toEqual(7);
    })
});

describe('testing mme class', () => {
    const testValues = [22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29, 22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63, 23.82, 23.87, 23.65, 23.19, 23.10, 23.33, 22.68, 23.10, 22.40, 22.17];
    
    test('test the mme values are setted', () => {
        const mme = new MMECalculation();
        mme.addValues(testValues).addRange(10);
        expect(mme.values).toEqual(testValues);
    });

    test('test the mme exponential weight calc', () => {
        const mme = new MMECalculation();
        mme.addValues(testValues).addRange(10);
        expect(mme.exponentialWeight).toEqual(0.18181818181818182);
    });

    test('test the mme10 calc', () => {
        const range = 10;
        const mms = new MMSCalculation();
        mms.addValues(testValues.slice(0,range)).addRange(range);

        const mme10 = new MMECalculation();
        mme10.lastMME = mms.calc();
        const result = mme10.addValues(testValues).addRange(range).calc();
        expect(result).toEqual(22.91500443403305);
    });

    test('update mme10 calc', () => {
        const range = 10;
        const mms = new MMSCalculation();
        mms.addValues(testValues.slice(0,range)).addRange(range);

        const mme10 = new MMECalculation();
        mme10.lastMME = mms.calc();
        mme10.addValues(testValues).addRange(range).calc();
        mme10.update(22.15);
        
        expect(mme10.currentMME).toEqual(22.775912718754313);
    })
});


describe('Test RSI class', () => {
    test('Test RSI calc', () => {
        const range = 14;
        const testValues = [12,11,12,14,18,12,15,13,16,12,11,13,15,14,16,18,22,19,24,17,19];
        const rsi = new RSICalculation();
        rsi.addValues(testValues).addRange(range).calc();

        expect(rsi.currentRSI).toEqual(55.2317220630741);
    });
});

describe("testing CalculationFacade", () => {
    const mmeTestValues = [22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29, 22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63, 23.82, 23.87, 23.65, 23.19, 23.10, 23.33, 22.68, 23.10, 22.40, 22.17];

    test('Testing mms facade', () => {
        const testValues = [5, 7, 8, 4];
        const range = 3;
        const mms = CalculationFacade.mms(testValues, range);
        expect(mms.calc()).toEqual(6.333333333333333);
    });

    test("Testing mme 10 facade", () => {
        const range = 10;
        const mme = CalculationFacade.mme(mmeTestValues, range);
        expect(mme.calc()).toEqual(22.91500443403305);
    });

    test("Testing update mme 10 facade", () => {
        const range = 10;
        const mme = CalculationFacade.mme(mmeTestValues, range);
        mme.calc();
        expect(mme.update(22.15)).toEqual(22.775912718754313);
    });

    test("test single average facade", () => {
        const values = [5, 7, 8, 4];
        const avg = CalculationFacade.avg(values);
        expect(avg.calc()).toEqual(6)
    });

    test("test rsi facade", () => {
        const values = [12,11,12,14,18,12,15,13,16,12,11,13,15,14,16,18,22,19,24,17,19];
        const range = 14;
        const rsi = CalculationFacade.rsi(values, range);
        expect(rsi.calc()).toEqual(55.2317220630741)
    });

    test("test ADX facade", async () => {
        const range = 14;
        const symbol = 'BTCBUSD';
        // const klines = await ApiHelper.getInstance().getLatestKlines(symbol, '1m', 100);

        // const candles = klines.map(kline => new Candle(kline, symbol));

        const candles = [
            new Candle(['1674011340000', '0', '90', '82', '87'], symbol),
            new Candle(['1674011340000', '0', '95', '85', '87'], symbol),
            new Candle(['1674011340000', '0', '105', '93', '97'], symbol),
            new Candle(['1674011340000', '0', '120', '106', '114'], symbol),
            new Candle(['1674011340000', '0', '140', '124', '133'], symbol),
            new Candle(['1674011340000', '0', '165', '147', '157'], symbol),
            new Candle(['1674011340000', '0', '195', '175', '186'], symbol),
            new Candle(['1674011340000', '0', '230', '204', '223'], symbol),
            new Candle(['1674011340000', '0', '270', '246', '264'], symbol),
            new Candle(['1674011340000', '0', '315', '289', '311'], symbol),
            new Candle(['1674011340000', '0', '365', '337', '350'], symbol),
        ];

        const adx = CalculationFacade.adx(candles, 5) as ADXCalculation;
        // console.table(adx.values);
        expect(adx.values[adx.values.length - 1].positiveDI).toEqual(83.74053399387346);
    });
})
