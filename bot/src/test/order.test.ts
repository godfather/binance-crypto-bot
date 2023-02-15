import { expect, test, describe, beforeAll, afterAll, jest } from '@jest/globals';
import { BuyOrder } from '../libs/orders/BuyOrder';
import { SellOrder } from '../libs/orders/SellOrder';
import { IOrder } from '../models/Order';

beforeAll(done => done());

afterAll(done => done());

// jest.setTimeout(10000);

describe('Testing order classes', () => {
    test('Testing buy order persist on database', async () => {
        const order = new BuyOrder('BNBUSDT', 10.00000000);
        order.setStopPrice(5.00000000);
        order.setTargetPrice(15.00000000);
        
        const result = await order.newOrder();
        expect(typeof result.orderId === 'number').toEqual(true);
        expect(result.sold!).toEqual(false);
    });

    test('Testing sell order and database persistence', async () => {
        const order = new SellOrder('BNBUSDT', 10.00000000);
        const result = await order.setCurrentPrice(290).newOrder() as IOrder;
        expect(typeof result.orderId === 'number').toEqual(true);
    });
});
