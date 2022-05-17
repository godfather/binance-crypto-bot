import WebSocket from "ws";

export abstract class Socket {
    private _ws:WebSocket;
    private _apiAddress:string;
    private _pingTimeout:NodeJS.Timeout;
    private _pingInterval:number;

    public constructor() {
        this._pingInterval = 60 * 4000
    }

    set apiAddress(address:string) {
        this._apiAddress = address;
    }

    public run():void {
        this.start();
        this._ws.onclose = this._onCloseHandler.bind(this);
        this._ws.onerror = this._onErrorHandler.bind(this);
        this._ws.onmessage = this.onMessageHandler.bind(this);
        this._ws.on('ping', this._onPingHandler.bind(this));

        this._ws.onopen = this.onOpenHandler.bind(this);
    }

    public start():void {
        console.log('starting websocket');
        this._ws = new WebSocket(this._apiAddress);
        this._heartbeat()
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

    private _onPingHandler(_:WebSocket.MessageEvent):void {
        this._heartbeat();
        console.log('PING!');
        this._ws.pong();
    }

    private _heartbeat() {
        clearTimeout(this._pingTimeout);
        this._pingTimeout = setTimeout(() => {
            this.restart();
            console.log('PING ERROR NOT RECEIVED');
        }, this._pingInterval);
    }

    public abstract onOpenHandler(event:WebSocket.Event):void;

    public abstract onMessageHandler(event:WebSocket.MessageEvent):void;
}