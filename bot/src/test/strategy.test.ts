import { expect, describe, test, jest } from '@jest/globals';
import EventEmitter from 'events';
import { MobileAverageStrategy } from '../libs/strategy/MobileAverageStrategy';

describe('Testing Strategies', () => {
    test('Testing mobile average trigger', () => {
        const symbol = 'BNBUSDT';
        const eventEmmiter = new EventEmitter;
        const strategyDefinition = {
            type: 'mm',
            data: {
                range: 25,
                mmeFast: 282.25045763344843,
                mmeSlow: 282.24045763344843
            }
        }
        
        const handlerCallback = jest.fn();
        const mmStrategy = new MobileAverageStrategy(eventEmmiter, handlerCallback, handlerCallback);

        mmStrategy.setParams(strategyDefinition).runTrigger();

        expect(handlerCallback).toBeCalledTimes(1);
    });
});