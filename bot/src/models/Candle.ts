import { IKline, ISocketKline } from "./iKline";

export class Candle {
    private _closePrice:number;
    private _openPrice: number
    private _minPrice: number;
    private _maxPrice: number;
    private _diffMaxMin: number;
    private _diffOpenClose: number;
    private _openTime:number;

    constructor(public data:IKline|ISocketKline, private _symbol:string) {
        this._processData(data);
    }

    public get symbol(): string {
        return this._symbol;
    }

    public get closePrice(): number {
        return this._closePrice;
    }

    public get openPrice(): number {
        return this._openPrice;
    }

    public get minPrice(): number {
        return this._minPrice;
    }

    public get maxPrice(): number {
        return this._maxPrice;
    }

    public get amplitude():number {
        return (this._maxPrice - this._minPrice) * 100 / this._minPrice;
    }

    public get size():number {
        return this._maxPrice - this._minPrice;
    }

    public get diffOpenClose():number {
        return this._openPrice - this._closePrice;
    }

    public get variation():number {
        if(this._openPrice > this._closePrice) {
            return (this._closePrice * 100 / this._openPrice) - 100;
        }

        if(this._openPrice < this._closePrice) {
            return (this._closePrice - this._openPrice) * 100 / this._openPrice;
        }

        return 0;
    }

    public get openTime():number {
        return this._openTime;
    }

    private _processKline(data:IKline): void {
        this._openTime = data[0] as number;
        this._closePrice = parseFloat(data[4] as string);
        this._openPrice = parseFloat(data[1] as string);
    }

    private _processSocketKline(data:ISocketKline): void {
        this._openTime = data.data.k.t;
        this._closePrice = parseFloat(data.data.k.c);
        this._openPrice = parseFloat(data.data.k.o);
    }

    private _processData(data:IKline|ISocketKline): void {
        this._isSocketData(data) ? this._processSocketKline(data as ISocketKline) : this._processKline(data as IKline);
    }

    private _isSocketData(data:IKline|ISocketKline): boolean {
        return (data as ISocketKline).data !== undefined;
    }
}