import { CandleBase } from "../models/candle-base";
import { CandleCollection } from "../types/candle-types";

export interface MMSymbol {
    symbol:string;
    mm:MM;
}

export class MM {
    private _mmSimple:number;
    private _mmExponential:number;
    private _difference:number;
    private _differenceRate:number;

    public constructor(private _candles:CandleBase[]) {
        this._calculateMMSimple();
    }

    get mmSimple():number { return this._mmSimple; }

    get mmExponential():number { return this._mmExponential; }

    get mmDifference():number { return this._difference; }
    get mmDifferenceRate():number { return this._differenceRate; }

    public updateCandles(candles:CandleBase[]) {
        this._candles = candles;
        this._calculateMMSimple();
    }


    private _calculateMMSimple():void {
        this._mmSimple = this._candles
            .map(candle => candle.closePrice)
            .reduce((prev, current) => prev + current, 0) / this._candles.length;
        
        this._calculateMMExponential();
    }

    private _calculateMMExponential():void {
        const lastMME = this._mmExponential ?? this._mmSimple;
        const latestClosePrice = this._candles[this._candles.length - 1].closePrice;
        const multiplier = this._exponentialWeight();
        this._mmExponential = latestClosePrice * multiplier + lastMME * (1 - multiplier);
        this._calculateDifference();
    }

    private _calculateDifference():void {
        this._difference = this.mmExponential - this._mmSimple;
        this._calculateDifferenceRate();
    }

    private _calculateDifferenceRate():void {
        this._differenceRate = this._difference * 100 / this._mmSimple;
    }

    private _exponentialWeight():number {
        return 2 / (this._candles.length + 1);
    }
}

export class MMCollection {
    private static _instance:MMCollection;
    private _mmCollection:MMSymbol[];
    
    private constructor() {
        this._mmCollection = [];
    }

    public static getInstance():MMCollection {
        if(!this._instance) this._instance = new MMCollection();
        return this._instance;
    }

    public update(candleCollection:CandleCollection):void {
        const mmIndex = this._mmCollection.findIndex(mm => mm.symbol === candleCollection.symbol);
        if(mmIndex > -1) this._mmCollection[mmIndex].mm.updateCandles(candleCollection.candles);
        else this._mmCollection.push({ symbol:candleCollection.symbol, mm:new MM(candleCollection.candles)});
    }

    public find(symbol:string):MMSymbol | undefined  {
        return this._mmCollection.find(mm => mm.symbol === symbol);
    }
}

