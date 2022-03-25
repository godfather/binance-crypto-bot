import 'dotenv/config';
import WebSocket from "ws";

export class Socket {
    private _ws:WebSocket;
    private _path:string;
    private static _instance:Socket;
    private _onOpenHandler:(event:WebSocket.Event) => void;
    private _onMessageHandler:(event:WebSocket.Event) => void;

    private constructor() {
        this._ws = new WebSocket(`${process.env.WS_URL!}${this._path}`);
    }

    public static getInstance():Socket {
        if(!this._instance) this._instance = new Socket();
        return this._instance;
    }

    public run():void {
        this._ws.onopen = this._onOpenHandler;
        this._ws.onclose = this._onCloseHandler;
        this._ws.onerror = this._onErrorHandler;
        this._ws.onmessage = this._onMessageHandler;
    }

    set onOpenHandler(fn:(event:WebSocket.Event) => void) {
        this._onOpenHandler = fn;
    }

    set onMessageHandler(fn:(event:WebSocket.Event) => void) {
        this._onMessageHandler = fn;
    }

    private _onCloseHandler(event:WebSocket.CloseEvent) {
        console.log("Connection closed " + event.code);
    }

    private _onErrorHandler(event:WebSocket.ErrorEvent) {
        console.error("Error: " + event.message);
    }
}