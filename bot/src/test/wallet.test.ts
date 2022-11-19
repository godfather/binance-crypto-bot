import { describe, expect, test, jest } from '@jest/globals';
import { Wallet } from '../models/Wallet';
import { ApiHelper } from '../api/api';

jest.setTimeout(10000);

describe('Testing Wallet', () => {
    test('testing wallet instantiation', async () => {
        const walletStatus = await ApiHelper.getPrivateInstance().getWalletInfo();
        const canTrade = Wallet.getInstance(walletStatus).status.canTrade;
        expect(canTrade).toEqual(true);
    });

    test('testing wallet status singleton', () => {
        expect(Wallet.getInstance().status.canTrade).toEqual(true);
    });

    test('testing wallet status update', done => {
        expect.assertions(1);
        const currentUpdatedAt = Wallet.getInstance().walletUpdatedAt;
        Wallet.getInstance().updateWallet(_ => {
            expect(Wallet.getInstance().walletUpdatedAt === currentUpdatedAt).toEqual(false);
            done();
        });
    });
});