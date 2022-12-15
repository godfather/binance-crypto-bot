import { Event, MessageEvent } from "ws";
import { Socket } from "./Socket"; 
import { Symbol } from "../../models/Symbol";

type MessageCallback = (event: MessageEvent) => void;

export class CryptoBot extends Socket {    
    private _messageCallback: MessageCallback;
    public constructor(_apiAddress: string, messageCallback: MessageCallback) {
        super(_apiAddress);

        this._messageCallback = messageCallback;
    }

    public onOpenHandler(_: Event): void {
        console.log('CONECTADO')
    }

    public onMessageHandler(event: MessageEvent): void {
        this._messageCallback(event);
    }
    
}