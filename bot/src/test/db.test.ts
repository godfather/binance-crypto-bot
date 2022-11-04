import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

import { conn } from '../libs/db/MongoConnection';
import Order from '../models/Order';

const orderResponseTest = {
    symbol: "BTCUSDT",
    orderId: 171201,
    orderListId: -1,
    clientOrderId: "fGdKUDsOh8W652SPHwDNPv",
    transactTime: 1667431504340,
    price: "9000.00000000",
    origQty: "0.01000000",
    executedQty: "0.01000000",
    cummulativeQuoteQty: "201.38620000",
    status: "FILLED",
    timeInForce: "GTC",
    type: "LIMIT",
    side: "SELL",
    fills: [
        {
            price: "20138.62000000",
            qty: "0.01000000",
            commission: "0.00000000",
            commissionAsset: "USDT",
            tradeId: 74215
        }
    ]
};


beforeAll(done => done());

afterAll(done => {
    conn.close();
    done();
})

describe('Test db', () => {
    test('Testing db connection', async () => {
        const connected = await conn.asPromise();
        expect(connected.readyState).toEqual(1);
    });

    test("Testing order creation", async () => {
        const order = await Order.create(orderResponseTest);
        expect(order.id).toBeTruthy();
    });

    test("testing order update", async () => {
        const order = await Order.findOneAndUpdate({ orderId: 171201 }, { sold: true}, { new:true });
        expect(order?.sold).toEqual(true);
    });

});