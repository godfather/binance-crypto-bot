import { expect, test, describe, beforeAll, afterAll } from '@jest/globals';
import { BuyOrder } from '../libs/orders/BuyOrder';

beforeAll(done => done());

afterAll(done => done())

describe('Testing order classes', () => {
    test('Testing buy order', async () => {
        const order = new BuyOrder('BNBUSDT', 10.00000000);
        const result = await order.newOrder();
        expect(typeof result.orderId === 'number').toEqual(true);
    });

    test('Testting order persistence', async () => {
        const order = new BuyOrder('BNBUSDT', 10.00000000);
        const orderResponse = await order.newOrder();
        const result = await order.persistOrder(orderResponse);
        expect(result.sold!).toEqual(false);
    });
});
