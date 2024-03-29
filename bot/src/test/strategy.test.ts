import { expect, describe, test, jest } from '@jest/globals';
import { MobileAverageStrategy } from '../libs/strategy/MobileAverageStrategy';
import { EnumStrategyResponse } from '../libs/strategy/IStrategy';
import { ApiHelper } from '../api/api';

describe('Testing Strategies', () => {
    test('Testing mobile average trigger', async () => {
        const klines = await ApiHelper.getInstance().getLatestKlines('BTCUSDT', '1m', 100);
        const mmeTestValues = klines.map(kline => parseFloat(kline[4].toString()));

        // const mmeTestValues = [22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29, 22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63, 23.82, 23.87, 23.65, 23.19, 23.10];
        
        const strategyDefinition = {
            type: 'ema',
            data: {
                fastRange: 25,
                slowRange: 50,
                longRange:100
            }
        }
        
        const mmStrategy = new MobileAverageStrategy();
        mmStrategy.setParams(strategyDefinition);

        // expect([
        //     EnumStrategyResponse.SELL,
        //     EnumStrategyResponse.BUY,
        //     EnumStrategyResponse.WAIT
        // ]).toContain(mmStrategy.runTrigger(mmeTestValues, 2, 1));
    });
});