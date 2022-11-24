export type ObserverListener<T> = (data:T) => void;

export class Observable<T> {
    protected _observers: ObserverListener<T>[] = [];
    private _value:T;
    
    // private constructor() {}

    public get value(): T {
        return this._value;
    }

    public set value(newValue:T) {
        this._value = newValue;
        this._notify();
    }

    public subscribe(listener:ObserverListener<T>): void {
        this._observers.push(listener);
    }

    public unsubscribe(listener:ObserverListener<T>): void {
        this._observers = this._observers.filter(observer => observer !== listener);
    }
    
    private _notify(): void {
        this._observers.forEach(observer => observer(this._value));
    }
}
