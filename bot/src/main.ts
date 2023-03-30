import 'dotenv/config';
import { ApiHelper } from "./api/api";
import { Wallet } from "./models/Wallet";
import { Observable } from "./libs/observer/Observable";
import { Symbol } from "./models/Symbol";
import { CryptoBot } from './libs/socket/CryptoBot';
import { MessageEvent } from "ws";
import { ISocketKline } from './models/iKline';
import { Socket } from './libs/socket/Socket';
import Order from './models/Order';
import { OrderSide } from './models/iOrder';


export class Main {
    private static _instance: Main;
    private static _baseSymbols: string[];
    public symbolsList: Observable<Symbol[]>;
    public wallet: Observable<Wallet>;
    private _socketUrl:Observable<string>;
    private _cryptoBot: Socket;
    private _initialized: boolean;
    private _socketRoundCount: number; //move this to socket class

    private constructor() {
        this.symbolsList = new Observable<Symbol[]>();
        this.wallet = new Observable<Wallet>();
        this._socketUrl = new Observable<string>();
        this._initialized = false;
        this._socketRoundCount = 0;
    };

    public static getInstance(baseSymbols: string[]) {
        if(!this._instance) this._instance = new Main();
        this._baseSymbols = baseSymbols;
        return this._instance;
    }

    public run() {
        this._getWallet().then(wallet => {
            console.table(wallet.status.balances);
            this.wallet.value = wallet;
            if(wallet.hasFounds) return this._setupSymbols();
            console.log('WALLET HAS NO FOUNDS :( ' + wallet.getBalance());
        });
        
        this._observers();
    }

    private _getWallet(): Promise<Wallet> {
        return ApiHelper.getPrivateInstance().getWalletInfo()
                .catch(console.log)
                .then(walletinfo => Wallet.getInstance(walletinfo!));
    }

    private _setupSymbols(): void {
        if(Main._baseSymbols.length === 0) return;

        Order.find({ sold: false, side: OrderSide.BUY }).then(orders => {
            Main._baseSymbols = Main._baseSymbols.concat(orders.map(order => order.symbol).filter(item => Main._baseSymbols.indexOf(item) < 0));
            
            console.log(Main._baseSymbols);

            const symbols = Main._baseSymbols.map(symbol => Symbol.build(symbol));

            return Promise.all(symbols);
        }).then(symbols => {
            symbols.forEach(s => s.setStrategy({
                type: 'ema',
                data: { fastRange: 25, slowRange: 50, longRange: 100 }
            }));

            this.symbolsList.value = symbols;
        });
    }

    private _observers() {
        this.symbolsList.subscribe(symbols => {
            this._mountSocketUrl(symbols);
        });

        this._socketUrl.subscribe(url => {
            console.log(url);
            if(this._socketRoundCount > 1) console.log('Restarting Bot...');

            if(this._cryptoBot) this._cryptoBot.stop(); //TODO: set cryptobot to null and 
            setTimeout(() => {
                this._cryptoBot = new CryptoBot(url, this._messageCallback.bind(this));
                this._cryptoBot.run();
            }, 1000);
        });
    }

    private _messageCallback(event: MessageEvent): void {
        const klineData = JSON.parse(event.data.toString()) as unknown as ISocketKline;
        const currentSymbol = this.symbolsList.value.find(symbol => symbol.symbol == klineData.data.k.s);
        
        if(!currentSymbol) return;

        if(currentSymbol.lastOpenTime === klineData.data.k.t) return;
        console.log(currentSymbol.round)
        currentSymbol.updateCandles(klineData); //TODO: if the current symbol was removed, it can't be updated
    }

    private _mountSocketUrl(symbols: Symbol[]): void {
        const streams = symbols.map(symbol => symbol.symbol.toLowerCase() + '@kline_1m');
        this._socketUrl.value = `${process.env.WS_URI}stream?streams=${streams.join('/')}`;
    }
}

Main.getInstance(['BNBUSDT', 'LTCUSDT', 'ETHUSDT', 'BTCUSDT']).run();
