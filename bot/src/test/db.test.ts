import { describe, expect, test } from '@jest/globals';
import { connected } from 'process';

import { conn } from '../libs/db/MongoConnection';

describe('Test db', () => {
    test('Testing db connection', async () => {
        const connected = await conn.asPromise();
        expect(connected.readyState).toEqual(1);
    });

});