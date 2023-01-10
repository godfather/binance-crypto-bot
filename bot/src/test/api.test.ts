import { describe, test, expect } from '@jest/globals';

import { ApiHelper } from '../api/api';
import { OrderSide, OrderStatus, OrderType } from '../models/iOrder';


describe("testing api endpoints", () => {
    test("get the current wallet status", async () => {
        const wallet = await ApiHelper.getPrivateInstance().getWalletInfo();
        expect(wallet.canTrade).toEqual(true);
    });

    test("get latest 24h gainers", async () => {
        const gainers = await ApiHelper.getInstance().getGainers();
        expect(typeof gainers[0].closeTime).toBe('number');
    });

    test("get symbol ticker data", async () => {
        const gainers = await ApiHelper.getInstance().getGainers(['BTCUSDT']);
        expect(typeof gainers[0].closeTime).toBe('number');
    });

    test("get last 25 klines from a symbol", async () => {
        const klines = await ApiHelper.getInstance().getLatestKlines('BTCUSDT', '1m', 25);
        expect(klines.length).toEqual(25);
    });

    test("get exchange info for a symbol", async () => {
        const info = await ApiHelper.getInstance().getExchangeInfo([ 'BTCUSDT' ]);
        expect(info.symbols[0].symbol).toEqual('BTCUSDT');
    });

    test("make a new order type BUY", async () => {
        const order = await ApiHelper.getPrivateInstance().newOrder('BNBUSDT', OrderSide.SELL, OrderType.MARKET, 1);
        expect(order.status).toEqual(OrderStatus.FILLED);
    });
});
