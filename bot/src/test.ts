import 'dotenv/config';
import { Socket } from "./libs/socket";
import WebSocket from "ws";
import { watch, readFile } from 'fs';

class CryptoBot extends Socket {

    public constructor(apiAddress:string) {
        super(apiAddress);
    }

    public onMessageHandler(event:WebSocket.MessageEvent):void {
        console.log(event.data);
    }

    public onOpenHandler(_:WebSocket.Event):void {
        console.log('onOpenHandler 123');    
    }

    public onCryptoListChange():void {
        const configPath = process.env.CONFIG_PATH!;
        watch(configPath, (_, filename) => {
            if(filename && /coin/.test(filename)) {
                readFile(`${configPath}/${filename}`, 'utf8', (err, dataString) => {
                    if(err) {
                        console.log(err);
                        return;
                    }
        
                    console.log(JSON.parse(dataString));
                    this.restart();
                });
            }
        });        
    }
}

const socket = new CryptoBot(`${process.env.WS_URI!}/btcbusd@kline_1m`);
socket.run();
socket.onCryptoListChange();