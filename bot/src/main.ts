import 'dotenv/config';
import { ApiHelper } from "./api/api";
import { Wallet } from "./models/Wallet";
import { Observable } from "./libs/observer/Observable";
import { Symbol } from "./models/Symbol";
import { CryptoBot } from './libs/socket/CryptoBot';
import { MessageEvent } from "ws";
import { ISocketKline } from './models/iKline';
import { Socket } from './libs/socket/Socket';


export class Main {
    private static _instance: Main;
    private static STABLE: string;
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

    public static getInstance(stable: string) {
        if(!this._instance) this._instance = new Main();
        this.STABLE = stable;
        return this._instance;
    }

    public run() {
        this._getWallet().then(wallet => {
            this.wallet.value = wallet;
            this._initGainers();
        });
        
        this._observers();
    }

    private _getWallet(): Promise<Wallet> {
        return ApiHelper.getPrivateInstance().getWalletInfo()
                .catch(console.log)
                .then(walletinfo => Wallet.getInstance(walletinfo!));
    }

    private async _getGainers(): Promise<void | Symbol[]> {
        const stabelRegex = new RegExp(`${Main.STABLE}$`);
        return ApiHelper.getInstance().getGainers([`BTC${Main.STABLE}`, `LTC${Main.STABLE}`, `ETH${Main.STABLE}`, `ADA${Main.STABLE}`])
        // return ApiHelper.getInstance().getGainers()
            .catch(console.log)
            .then(async gainers => {
                return gainers!.sort((g1, g2) => {
                    return parseFloat(g2.priceChangePercent) - parseFloat(g1.priceChangePercent);
                })
                // .filter(gainer => parseFloat(gainer.priceChangePercent) > 0)
                .filter(gainer => stabelRegex.test(gainer.symbol))
                // .slice(0,3)
                .map(async gainer => {
                    return await Symbol.build(gainer.symbol, parseFloat(gainer.volume), parseFloat(gainer.priceChangePercent));
                });
            })
            .then(symbols => {
                if(symbols.length < 1) return;
                return Promise.all(symbols)
            })
    }

    private _initGainers() {
        setTimeout(() => {
            console.log('aqui ' + this._initialized);
            this._initialized = true;

            this._getGainers().then(symbols => {
                if(!symbols || symbols.length < 1) {
                    console.log('Symbols List is empty...');
                    return this._initGainers();
                }
                return this._setupSymbols(symbols!);
            });

        }, (!this._initialized ? 10 : 60 * 10 * 1000));
    }

    private _setupSymbols(symbols: Symbol[]): void {
        if(symbols.length < 1) return;

        symbols.forEach(s => s.setStrategy({
            type: 'ema',
            data: { fastRange: 25, slowRange: 50, longRange: 100 }
        }));

        this.symbolsList.value = symbols;
    }

    private _observers() {
        this.symbolsList.subscribe(symbols => {
            if(symbols.length < 1) {
                console.log('Symbols List is empty...');
                return this._initGainers();             
            }

            this._mountSocketUrl(symbols);
        });

        this.wallet.subscribe(wallet => console.table(wallet.status.balances)); //TODO: remove this log

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
        
        // if((currentSymbol.round > 2 && 
        //     currentSymbol.stopPrice > parseFloat(klineData.data.k.c)) || //TODO: remove this condition
        //     currentSymbol.stagnedRouds >= 30) {
            
        //     console.log('STAGNED ROUND: ' + currentSymbol.stagnedRouds);
        //     console.log(`REMOVING SYMBOL ${currentSymbol.symbol}\n STOP PRICE: ${currentSymbol.stopPrice} CURRENT PRICE: ${klineData.data.k.c}`);
            
        //     currentSymbol.stopSymbolBot().then(() => {
        //         this.symbolsList.value = this.symbolsList.value.filter(symbol => symbol.symbol != currentSymbol.symbol);
        //     });            

        //     return;
        // }

        currentSymbol.updateCandles(klineData); //TODO: if the current symbol was removed, it can't be updated
    }

    private _mountSocketUrl(symbols: Symbol[]): void {
        const streams = symbols.map(symbol => symbol.symbol.toLowerCase() + '@kline_1m');
        this._socketUrl.value = `${process.env.WS_URI}stream?streams=${streams.join('/')}`;
    }
}

Main.getInstance('USDT').run();
