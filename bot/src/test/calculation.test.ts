import { MMSCalculation } from "../libs/calculations/MMSCalculation";
import { MMECalculation } from "../libs/calculations/MMECalculation";
import { RSICalculation } from "../libs/calculations/RSICalculation";
import { CalculationFacade } from "../libs/calculations/CalculationFacade";

import { test, describe, expect } from '@jest/globals';
import { ApiHelper } from "../api/api";
import { Candle } from "../models/Candle";
import { ADXCalculation } from "../libs/calculations/ADXCalculation";

//test values


// describe('testing mms class', () => {
//     const testValues = [5, 7, 8, 4]; //values to test

//     test('test the mms values are setted', () => {
//         const mms = new MMSCalculation(); //MMSCalculation instance
//         mms.addValues(testValues);
//         expect(mms.values).toEqual(testValues);
//     });

//     test('test the mms calc', () => {
//         const mms = new MMSCalculation(); //MMSCalculation instance
//         const result = mms.addValues(testValues).addRange(3).calc();
//         expect(result).toEqual(6.333333333333333);
//     });

//     test('test mms update', () => {
//         const mms = new MMSCalculation(); //MMSCalculation instance
//         mms.addValues(testValues).addRange(3).calc();
//         const result = mms.update(9); 
//         expect(result).toEqual(7);
//     })
// });

// describe('testing mme class', () => {
//     const testValues = [22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29, 22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63, 23.82, 23.87, 23.65, 23.19, 23.10, 23.33, 22.68, 23.10, 22.40, 22.17];
    
//     test('test the mme values are setted', () => {
//         const mme = new MMECalculation();
//         mme.addValues(testValues).addRange(10);
//         expect(mme.values).toEqual(testValues);
//     });

//     test('test the mme exponential weight calc', () => {
//         const mme = new MMECalculation();
//         mme.addValues(testValues).addRange(10);
//         expect(mme.exponentialWeight).toEqual(0.18181818181818182);
//     });

//     test('test the mme10 calc', () => {
//         const range = 10;
//         const mms = new MMSCalculation();
//         mms.addValues(testValues.slice(0,range)).addRange(range);

//         const mme10 = new MMECalculation();
//         mme10.lastMME = mms.calc();
//         const result = mme10.addValues(testValues).addRange(range).calc();
//         expect(result).toEqual(22.91500443403305);
//     });

//     test('update mme10 calc', () => {
//         const range = 10;
//         const mms = new MMSCalculation();
//         mms.addValues(testValues.slice(0,range)).addRange(range);

//         const mme10 = new MMECalculation();
//         mme10.lastMME = mms.calc();
//         mme10.addValues(testValues).addRange(range).calc();
//         mme10.update(22.15);
        
//         expect(mme10.currentMME).toEqual(22.775912718754313);
//     })
// });


// describe('Test RSI class', () => {
//     test('Test RSI calc', () => {
//         const range = 14;
//         const testValues = [12,11,12,14,18,12,15,13,16,12,11,13,15,14,16,18,22,19,24,17,19];
//         const rsi = new RSICalculation();
//         rsi.addValues(testValues).addRange(range).calc();

//         expect(rsi.currentRSI).toEqual(55.2317220630741);
//     });
// });

describe("testing CalculationFacade", () => {
    const mmeTestValues = [22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29, 22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63, 23.82, 23.87, 23.65, 23.19, 23.10, 23.33, 22.68, 23.10, 22.40, 22.17];

    // test('Testing mms facade', () => {
    //     const testValues = [5, 7, 8, 4];
    //     const range = 3;
    //     const mms = CalculationFacade.mms(testValues, range);
    //     expect(mms.calc()).toEqual(6.333333333333333);
    // });

    // test("Testing mme 10 facade", () => {
    //     const range = 10;
    //     const mme = CalculationFacade.mme(mmeTestValues, range);
    //     expect(mme.calc()).toEqual(22.91500443403305);
    // });

    // test("Testing update mme 10 facade", () => {
    //     const range = 10;
    //     const mme = CalculationFacade.mme(mmeTestValues, range);
    //     mme.calc();
    //     expect(mme.update(22.15)).toEqual(22.775912718754313);
    // });

    // test("test single average facade", () => {
    //     const values = [5, 7, 8, 4];
    //     const avg = CalculationFacade.avg(values);
    //     expect(avg.calc()).toEqual(6)
    // });

    // test("test rsi facade", () => {
    //     const values = [12,11,12,14,18,12,15,13,16,12,11,13,15,14,16,18,22,19,24,17,19];
    //     const range = 14;
    //     const rsi = CalculationFacade.rsi(values, range);
    //     expect(rsi.calc()).toEqual(55.2317220630741)
    // });

    test("test ADX facade", async () => {
        const range = 14;
        const symbol = 'BTCBUSD';
        // const klines = await ApiHelper.getInstance().getLatestKlines(symbol, '1m', 100);

        // const candles = klines.map(kline => new Candle(kline, symbol));

        // const candles = [
        //     new Candle(['1674011340000', '0', '90', '82', '87'], symbol),
        //     new Candle(['1674011340000', '0', '95', '85', '87'], symbol),
        //     new Candle(['1674011340000', '0', '105', '93', '97'], symbol),
        //     new Candle(['1674011340000', '0', '120', '106', '114'], symbol),
        //     new Candle(['1674011340000', '0', '140', '124', '133'], symbol),
        //     new Candle(['1674011340000', '0', '165', '147', '157'], symbol),
        //     new Candle(['1674011340000', '0', '195', '175', '186'], symbol),
        //     new Candle(['1674011340000', '0', '230', '204', '223'], symbol),
        //     new Candle(['1674011340000', '0', '270', '246', '264'], symbol),
        //     new Candle(['1674011340000', '0', '315', '289', '311'], symbol),
        //     new Candle(['1674011340000', '0', '365', '337', '350'], symbol),
        // ];

        const candles = [
            new Candle(['1674421920000', '0', '0.3748', '0.3733', '0.3735'], symbol),
            new Candle(['1674421980000', '0', '0.3735', '0.3723', '0.3727'], symbol),
            new Candle(['1674422040000', '0', '0.374 ', '0.3726', '0.3732'], symbol),
            new Candle(['1674422100000', '0', '0.3738', '0.3729', '0.3737'], symbol),
            new Candle(['1674422160000', '0', '0.3753', '0.3738', '0.3748'], symbol),
            new Candle(['1674422220000', '0', '0.375 ', '0.3739', '0.374'], symbol),
            new Candle(['1674422280000', '0', '0.3742', '0.3735', '0.3736'], symbol),
            new Candle(['1674422340000', '0', '0.3736', '0.3723', '0.373'], symbol),
            new Candle(['1674422400000', '0', '0.3732', '0.3717', '0.372'], symbol),
            new Candle(['1674422460000', '0', '0.3728', '0.3721', '0.3727'], symbol),
            new Candle(['1674422520000', '0', '0.3728', '0.3713', '0.3714'], symbol),
            new Candle(['1674422580000', '0', '0.3736', '0.3713', '0.3735'], symbol),
            new Candle(['1674422640000', '0', '0.3738', '0.3733', '0.3736'], symbol),
            new Candle(['1674422700000', '0', '0.3748', '0.3737', '0.3738'], symbol),
            new Candle(['1674422760000', '0', '0.3739', '0.3732', '0.3733'], symbol),
            new Candle(['1674422820000', '0', '0.3735', '0.3732', '0.3734'], symbol),
            new Candle(['1674422880000', '0', '0.3743', '0.3733', '0.3738'], symbol),
            new Candle(['1674422940000', '0', '0.3745', '0.3739', '0.3743'], symbol),
            new Candle(['1674423000000', '0', '0.3749', '0.3744', '0.3748'], symbol),
            new Candle(['1674423060000', '0', '0.3752', '0.3746', '0.3749'], symbol),
            new Candle(['1674423120000', '0', '0.3754', '0.3746', '0.3752'], symbol),
            new Candle(['1674423180000', '0', '0.3762', '0.3747', '0.376'], symbol),
            new Candle(['1674423240000', '0', '0.376 ', '0.3756', '0.3759'], symbol),
            new Candle(['1674423300000', '0', '0.3762', '0.3745', '0.3747'], symbol),
            new Candle(['1674423360000', '0', '0.375 ', '0.3744', '0.375'], symbol),
            new Candle(['1674423420000', '0', '0.3754', '0.375' , '0.3754'], symbol),
            new Candle(['1674423480000', '0', '0.3753', '0.375' , '0.3752'], symbol),
            new Candle(['1674423540000', '0', '0.3754', '0.3748', '0.3754'], symbol),
            new Candle(['1674423600000', '0', '0.3759', '0.3754', '0.3754'], symbol),
            new Candle(['1674423660000', '0', '0.3758', '0.3752', '0.3757'], symbol),
            new Candle(['1674423720000', '0', '0.3756', '0.3753', '0.3755'], symbol),
            new Candle(['1674423780000', '0', '0.3759', '0.3756', '0.3759'], symbol),
            new Candle(['1674423840000', '0', '0.376 ', '0.3752', '0.3754'], symbol),
            new Candle(['1674423900000', '0', '0.3753', '0.3747', '0.3749'], symbol),
            new Candle(['1674423960000', '0', '0.375 ', '0.3745', '0.3746'], symbol),
            new Candle(['1674424020000', '0', '0.3749', '0.3746', '0.3748'], symbol),
            new Candle(['1674424080000', '0', '0.3749', '0.3747', '0.3748'], symbol),
            new Candle(['1674424140000', '0', '0.3757', '0.3748', '0.3756'], symbol),
            new Candle(['1674424200000', '0', '0.3758', '0.3751', '0.3753'], symbol),
            new Candle(['1674424260000', '0', '0.3756', '0.3746', '0.3746'], symbol),
            new Candle(['1674424320000', '0', '0.3755', '0.374' , '0.3755'], symbol),
            new Candle(['1674424380000', '0', '0.3764', '0.3756', '0.3758'], symbol),
            new Candle(['1674424440000', '0', '0.3758', '0.3752', '0.3756'], symbol),
            new Candle(['1674424500000', '0', '0.3759', '0.3751', '0.3751'], symbol),
            new Candle(['1674424560000', '0', '0.3752', '0.3745', '0.3746'], symbol),
            new Candle(['1674424620000', '0', '0.3746', '0.374' , '0.3741'], symbol),
            new Candle(['1674424680000', '0', '0.3752', '0.3738', '0.3752'], symbol),
            new Candle(['1674424740000', '0', '0.3751', '0.3744', '0.3745'], symbol),
            new Candle(['1674424800000', '0', '0.3754', '0.3745', '0.3754'], symbol),
            new Candle(['1674424860000', '0', '0.3755', '0.3747', '0.3747'], symbol),
            new Candle(['1674424920000', '0', '0.3747', '0.3742', '0.3745'], symbol),
            new Candle(['1674424980000', '0', '0.375 ', '0.3743', '0.3746'], symbol),
            new Candle(['1674425040000', '0', '0.3746', '0.3744', '0.3745'], symbol),
            new Candle(['1674425100000', '0', '0.3747', '0.3743', '0.3743'], symbol),
            new Candle(['1674425160000', '0', '0.375 ', '0.3743', '0.3749'], symbol),
            new Candle(['1674425220000', '0', '0.3749', '0.3741', '0.3742'], symbol),
            new Candle(['1674425280000', '0', '0.3743', '0.3737', '0.3737'], symbol),
            new Candle(['1674425340000', '0', '0.3739', '0.3735', '0.3739'], symbol),
            new Candle(['1674425400000', '0', '0.3741', '0.3736', '0.3741'], symbol),
            new Candle(['1674425460000', '0', '0.3744', '0.3741', '0.3743'], symbol),
            new Candle(['1674425520000', '0', '0.3753', '0.3743', '0.375'], symbol),
            new Candle(['1674425580000', '0', '0.3751', '0.3749', '0.3751'], symbol),
            new Candle(['1674425640000', '0', '0.3751', '0.3749', '0.3751'], symbol),
            new Candle(['1674425700000', '0', '0.3752', '0.3747', '0.3747'], symbol),
            new Candle(['1674425760000', '0', '0.3747', '0.3744', '0.3744'], symbol),
            new Candle(['1674425820000', '0', '0.3747', '0.3741', '0.3742'], symbol),
            new Candle(['1674425880000', '0', '0.3745', '0.3741', '0.3744'], symbol),
            new Candle(['1674425940000', '0', '0.3744', '0.3741', '0.3742'], symbol),
            new Candle(['1674426000000', '0', '0.3741', '0.3733', '0.3735'], symbol),
            new Candle(['1674426060000', '0', '0.3738', '0.3732', '0.3734'], symbol),
            new Candle(['1674426120000', '0', '0.3735', '0.3732', '0.3735'], symbol),
            new Candle(['1674426180000', '0', '0.3738', '0.3735', '0.3736'], symbol),
            new Candle(['1674426240000', '0', '0.3736', '0.3731', '0.3731'], symbol),
            new Candle(['1674426300000', '0', '0.3734', '0.3732', '0.3733'], symbol),
            new Candle(['1674426360000', '0', '0.3733', '0.373' , '0.373'], symbol),
            new Candle(['1674426420000', '0', '0.3738', '0.3731', '0.3738'], symbol),
            new Candle(['1674426480000', '0', '0.3738', '0.3737', '0.3738'], symbol),
            new Candle(['1674426540000', '0', '0.3738', '0.3732', '0.3733'], symbol),
            new Candle(['1674426600000', '0', '0.3735', '0.3733', '0.3733'], symbol),
            new Candle(['1674426660000', '0', '0.3734', '0.3724', '0.3725'], symbol),
            new Candle(['1674426720000', '0', '0.3733', '0.3725', '0.3733'], symbol),
            new Candle(['1674426780000', '0', '0.3736', '0.3731', '0.3736'], symbol),
            new Candle(['1674426840000', '0', '0.3741', '0.3734', '0.3734'], symbol),
            new Candle(['1674426900000', '0', '0.3736', '0.3733', '0.3736'], symbol),
            new Candle(['1674426960000', '0', '0.3737', '0.3734', '0.3737'], symbol),
            new Candle(['1674427020000', '0', '0.3741', '0.3737', '0.3741'], symbol),
            new Candle(['1674427080000', '0', '0.3743', '0.374' , '0.3743'], symbol),
            new Candle(['1674427140000', '0', '0.3743', '0.3737', '0.3738'], symbol),
            new Candle(['1674427200000', '0', '0.3737', '0.3735', '0.3735'], symbol),
            new Candle(['1674427260000', '0', '0.374 ', '0.3735', '0.374'], symbol),
            new Candle(['1674427320000', '0', '0.374 ', '0.3736', '0.3737'], symbol),
            new Candle(['1674427380000', '0', '0.3737', '0.3736', '0.3737'], symbol),
            new Candle(['1674427440000', '0', '0.3743', '0.3737', '0.3743'], symbol),
            new Candle(['1674427500000', '0', '0.3746', '0.3743', '0.3743'], symbol),
            new Candle(['1674427560000', '0', '0.3743', '0.3739', '0.3739'], symbol),
            new Candle(['1674427620000', '0', '0.374 ', '0.3738', '0.374'], symbol),
            new Candle(['1674427680000', '0', '0.3741', '0.3739', '0.3741'], symbol),
            new Candle(['1674427740000', '0', '0.3743', '0.3728', '0.3737'], symbol),
            new Candle(['1674427800000', '0', '0.3744', '0.3738', '0.3744'], symbol),
            // new Candle(['1674427860000', '0', '0.3743', '0.3743', '0.3743'], symbol),
        ];        

        const adx = CalculationFacade.adx(candles, 14) as ADXCalculation;
        console.table(adx.values);
        // expect(adx.values[adx.values.length - 1].positiveDI).toEqual(83.74053399387346);
    });
})

