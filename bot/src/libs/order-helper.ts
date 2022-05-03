export class OrderHelper {
    private static _instance:OrderHelper;
    private _totalAumont:number;
    private _totalPerCoin:{ [key:string]:number }
    private _minValue:number;

    private constructor() {
        this._totalPerCoin = {};
    }

    public static getInstance():OrderHelper {
        if(this._instance) return this._instance;
        this._instance = new OrderHelper();
        return this._instance;
    }

    public init(total:number, coins:string[], minValue = 10.00):void {
        this._minValue = minValue;
        this._totalAumont = total;        
        coins.forEach(coin => this._totalPerCoin[coin] = (this._totalAumont / coins.length));
    }

    public getAumont(symbol:string, currentSymbolPrice:number):Promise<number> {
        console.log(this._totalPerCoin);

        let buyValue = this._totalPerCoin[symbol] / 10;
        let aumont = 0;

        if(this._totalPerCoin[symbol] < this._minValue) aumont = this._totalPerCoin[symbol];
        // else if(buyValue < this._minValue) aumont = this._minValue;
        else aumont = buyValue;

        return new Promise<number>((resolve, reject) => {
            if(!this._totalAumont) reject(`Saldo não inicializado`);
            else if(aumont > 0) resolve(aumont / currentSymbolPrice);
            else reject(`Saldo insuficiente ${symbol} ${this._totalPerCoin[symbol]}`);
        });
    }

    public decreseAumont(symbol:string, aumont:number) {
        this._totalPerCoin[symbol] -= aumont;
    }
}