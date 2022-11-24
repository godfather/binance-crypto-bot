import { describe, test, expect } from '@jest/globals';
import { Observable } from '../libs/observer/Observable';

describe("Testing observable class", () => {

    test('testing observable callback call on update data', done => {
        class ObserverTest {
            public testValue:Observable<string> = new Observable<string>();
            
            constructor(initialvalue:string) {
                this.testValue.value = initialvalue;
                this.observers();
            }

            private observers():void {
                this.testValue.subscribe((value) => {
                    console.log(`The new value is: ${value}`);
                    expect(value).toEqual('new value');
                    done();
                });
            }
        }

        expect.assertions(1);
        const test = new ObserverTest('valor inicial');
        test.testValue.value = 'new value';
    });
});