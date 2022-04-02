import WebSocket from "ws";

export abstract class Socket {
    private _ws:WebSocket;
    private _apiAddress:string;

    public constructor(address:string) {
        this._apiAddress = address;
    }

    public run():void {
        this.start();
        this._ws.onopen = this.onOpenHandler;
        this._ws.onclose = this._onCloseHandler;
        this._ws.onerror = this._onErrorHandler;
        this._ws.onmessage = this.onMessageHandler;
    }

    public start():void {
        console.log('starting websocket');
        console.log(this._apiAddress);
        this._ws = new WebSocket(this._apiAddress);
    }

    public stop():Promise<void> {
        console.log('stopping websocket');
        this._ws.close();
        return new Promise<void>(resolve => resolve());
    }

    public restart():void {
        this.stop().then(() => setTimeout(this.run.bind(this), 1000));
    }

    private _onCloseHandler(event:WebSocket.CloseEvent) {
        console.log("Connection closed " + event.code);
    }

    private _onErrorHandler(event:WebSocket.ErrorEvent) {
        this._ws.close();
        console.error(event);
    }

    public abstract onOpenHandler(event:WebSocket.Event):void;

    public abstract onMessageHandler(event:WebSocket.MessageEvent):void;
}