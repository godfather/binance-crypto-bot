import { OrderSide } from "../types/order-types";

export type StateEvent = {
    key:string;
    target:EventTarget;
}

export type EventTarget = {
    type:OrderSide;
    symbol:string;
    handler:Function;
}

export class State {
    private _events:Map<string, StateEvent>;
    private static _instance:State;

    private constructor() {
        this._events = new Map();
    }

    get stateSize() {
        return this._events.size;
    }

    public static getInstance() {
        if(this._instance) return this._instance;
        this._instance = new State();
        return this._instance;
    }

    public addEventListener(eventKey:string, eventTarget:EventTarget) {
        if(this._events.has(eventKey)) return;
        const event:StateEvent = { key:eventKey, target:eventTarget }
        this._events = new Map(this._events).set(eventKey, event);        
    }

    public dispatchEvent(eventKey:string) {
        if(!this._events.has(eventKey)) return;

        const events = new Map(this._events);
        const event = events.get(eventKey)!;
        event.target.handler();
        events.delete(event.key); //delete the event only on the handler callback
        this._events = new Map(events);
    }
}