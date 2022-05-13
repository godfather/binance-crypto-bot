import Symbol, { ISymbol } from "../models/symbol-config";
import { OrderSide } from "../types/order-types";

export class OrderHelper {
    private static _instance:OrderHelper;
    private _coins:ISymbol[];

    private constructor() {
        this._loadSymbols();
    }

    public static getInstance():OrderHelper {
        if(this._instance) return this._instance;
        this._instance = new OrderHelper();
        return this._instance;
    }

    public reloadSymbols():void {
        this._loadSymbols();
    }

    public getSymbol(symbol:string):ISymbol {
        return this._coins.find(coin => coin.symbol === symbol) as ISymbol;
    }

    // public getAumont(symbol:string, currentSymbolPrice:number, side:OrderSide):Promise<number> {
    //     const coin = this._coins.find(scoin => scoin.symbol == symbol)!;

    //     if(side === OrderSide.BUY) return new Promise<number>((resolve, reject) => {
    //         if(coin) return resolve(coin.filters.minNotional);
    //         else return reject('Symbol not configured');
    //     });

    //     let buyValue = coin.aumont / 10;
    //     let aumont = 0;

    //     if(coin.aumont < this._minValue) aumont = coin.aumont;
    //     // else if(buyValue < this._minValue) aumont = this._minValue;
    //     else aumont = buyValue;

    //     return new Promise<number>((resolve, reject) => {
    //         if(!coin.aumont) reject(`Saldo insuficiente ${coin.symbol} ${coin.aumont}`);
    //         else if(aumont > 0) resolve(aumont / currentSymbolPrice);
    //         else reject(`Saldo insuficiente ${symbol} ${coin.aumont}`);
    //     });
    // }

    public updateAumont(symbol:string, aumont:number) {
        return Symbol.updateOne({ symbol:symbol }, {$inc:{ aumont:aumont}}, { new:true }).then(result => console.log(result));
    }

    private _loadSymbols() {
        Symbol.find({}).then(coins => this._coins = coins).catch(err => { throw new Error(err) });
    }
}