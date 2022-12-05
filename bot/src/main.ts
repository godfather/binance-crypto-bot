import { ApiHelper } from "./api/api";
import { Wallet } from "./models/Wallet";
import { Observable } from "./libs/observer/Observable";
import { Symbol } from "./models/Symbol";



export class Main {
    private static _instance: Main;
    private static STABLE: string;
    public symbolsList: Observable<Symbol[]>;
    public wallet: Observable<Wallet>;

    private constructor() {
        this.symbolsList = new Observable<Symbol[]>();
        this.wallet = new Observable<Wallet>();
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
                this.symbolsList.value = symbols;
            });
        });
        
        this._observers();
    }

    private _getWallet(): Promise<Wallet> {
        return ApiHelper.getPrivateInstance().getWalletInfo().then(walletinfo => Wallet.getInstance(walletinfo));
    }

    private async _getGeiners(): Promise<Symbol[]> {
        const stabelRegex = new RegExp(`${Main.STABLE}$`);
        return ApiHelper.getInstance().getGainers()
            .then(async gainers => {
                return gainers.sort((g1, g2) => {
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
            if(symbols.length > 0) console.table(symbols);
        });

        this.wallet.subscribe(wallet => console.table(wallet.status.balances));
    }
}

Main.getInstance('USDT').run();
