import 'dotenv/config';
import WebSocket from "ws";

export class Socket {
    private _ws:WebSocket;
    private _path:string;

    private constructor() {
        this._ws = new WebSocket(`${process.env.WS_URL!}${this._path}`);
    }

    public static getInstance() {
        
    }
}