import 'dotenv/config';
import { ApiHelper } from "./api/api";
import { Wallet } from "./models/Wallet";
import { Observable } from "./libs/observer/Observable";
import { Symbol } from "./models/Symbol";
import { CryptoBot } from './libs/socket/CryptoBot';
import { MessageEvent } from "ws";
import { ISocketKline } from './models/iKline';


export class Main {
    private static _instance: Main;
    private static STABLE: string;
    public symbolsList: Observable<Symbol[]>;
    public wallet: Observable<Wallet>;
    private _socketUrl:Observable<string>;

    private constructor() {
        this.symbolsList = new Observable<Symbol[]>();
        this.wallet = new Observable<Wallet>();
        this._socketUrl = new Observable<string>();
    };

    public static getInstance(stable: string) {
        if(!this._instance) this._instance = new Main();
        this.STABLE = stable;
        return this._instance;
    }

    public run() {
        this._getWallet().then(wallet => {
            this.wallet.value = wallet;

            this._getGeiners().then(symbols => {
                symbols.forEach(s => s.setStrategy(
                    {
                        type: 'ema',
                        data: {
                            fastRange: 7,
                            slowRange: 25
                        }
                    }
                ))
                this.symbolsList.value = symbols;
            });
        });
        
        this._observers();
    }

    private _getWallet(): Promise<Wallet> {
        return ApiHelper.getPrivateInstance().getWalletInfo()
                .catch(console.log)
                .then(walletinfo => Wallet.getInstance(walletinfo!));
    }

    private async _getGeiners(): Promise<Symbol[]> {
        const stabelRegex = new RegExp(`${Main.STABLE}$`);
        return ApiHelper.getInstance().getGainers()
            .catch(console.log)
            .then(async gainers => {
                return gainers!.sort((g1, g2) => {
                    return parseFloat(g2.priceChangePercent) - parseFloat(g1.priceChangePercent);
                })
                .filter(gainer => parseFloat(gainer.priceChangePercent) > 0)
                .filter(gainer => stabelRegex.test(gainer.symbol))
                .map(async gainer => {
                    return await Symbol.build(gainer.symbol, parseFloat(gainer.volume), parseFloat(gainer.priceChangePercent));
                });
            })
            .then(symbols => Promise.all(symbols))
    }

    private _observers() {
        this.symbolsList.subscribe(symbols => {
            if(symbols.length < 1) return;             
            this._mountSocketUrl(symbols);
        });

        this.wallet.subscribe(wallet => console.table(wallet.status.balances));

        this._socketUrl.subscribe(url => {
            console.log(url);
            const cryptoBot = new CryptoBot(url, this._messageCallback.bind(this));
            cryptoBot.run();
        });
    }

    private _messageCallback(event: MessageEvent): void {
        const klineData = JSON.parse(event.data.toString()) as unknown as ISocketKline;
        const currentSymbol = this.symbolsList.value.find(symbol => symbol.symbol == klineData.data.k.s);

        if(!currentSymbol || currentSymbol.lastOpenTime === klineData.data.k.t) return;
        console.log(currentSymbol!.lastOpenTime, klineData.data.k.t);
        console.log(currentSymbol!.candlesSize, currentSymbol!.candles[currentSymbol!.candlesSize -1].closePrice, klineData.data.k.c);

        currentSymbol.updateCandles(klineData);
    }

    private _mountSocketUrl(symbols: Symbol[]): void {
        const streams = symbols.map(symbol => symbol.symbol.toLowerCase() + '@kline_1m');
        this._socketUrl.value = `${process.env.WS_URI}stream?streams=${streams.join('/')}`;
    }
}

Main.getInstance('USDT').run();
