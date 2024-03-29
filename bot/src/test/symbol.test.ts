import { expect, describe, test, jest, beforeEach } from '@jest/globals';
import { ApiHelper } from '../api/api';
import { EnumStrategyResponse } from '../libs/strategy/IStrategy';
import { EnumExangeInfoFilterType } from '../models/iExchangeInfo';
import { ISocketKline } from '../models/iKline';

import { Symbol } from '../models/Symbol';
import { Wallet } from '../models/Wallet';

jest.setTimeout(10000);

describe('Testing the symbol class\' methods', () => {
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

    test('testing symbol creation', async () => {
        const symbol = await Symbol.build('BNBUSDT');
        const filter = symbol.exchangeInfo.symbols[0].filters.find(filter => filter.filterType == EnumExangeInfoFilterType.MIN_NOTIONAL);
        expect.assertions(2);
        expect(symbol.candlesSize).toEqual(25);
        expect(filter!.filterType).toEqual(EnumExangeInfoFilterType.MIN_NOTIONAL);
    });

    test('testing updating symbols candles', async () => {
        expect.assertions(2);

        const symbol = await Symbol.build('BNBUSDT');
        symbol.updateCandles(testKline);
        expect(symbol.candles[symbol.candles.length - 1].closePrice).toEqual(0.0020);
        expect(symbol.candlesSize).toEqual(25);
    });

    test('Testing if symbol strategy is running on candles update', done => {
        // jest.useFakeTimers();
        const strategyDefinition = {
            type: 'ema',
            data: {
                fastRange: 7,
                slowRange: 25
            }
        };

        expect.assertions(2);

        ApiHelper.getPrivateInstance().getWalletInfo().then(wStatus => {
            const wallet = Wallet.getInstance(wStatus);
            return wallet;
        }).then(wallet => {
            const currentBNBBalance = wallet.status.balances.find(balance => balance.asset === 'BNB')!.free;    
            console.log(currentBNBBalance);

            Symbol.build('BNBUSDT').then(symbol => {
                symbol.setStrategy(strategyDefinition);    
                testKline.data.k.c = symbol.candles[symbol.candles.length - 1].closePrice.toString(); // Close price
                symbol.updateCandles(testKline);
                setTimeout(function() { 
                    const newBNBBalance = wallet.status.balances.find(ballance => ballance.asset === 'BNB')!.free;
                    console.log(currentBNBBalance, newBNBBalance);
                    expect(newBNBBalance).not.toEqual(currentBNBBalance); 
                    expect(symbol.triggerStatus).toBeDefined(); 
                    done(); 
                }, 5000);
            });
        });
    });
});