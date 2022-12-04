import { ApiHelper } from "../api/api";
import { CalculationFacade } from "../libs/calculations/CalculationFacade";
import { Observable } from "../libs/observer/Observable";
import { EnumStrategyResponse, IStrategy, IStrategyDefinition } from "../libs/strategy/IStrategy";
import { StrategyFactory } from "../libs/strategy/StrategyFactory";
import { Candle } from "./Candle";
import { IKline, ISocketKline } from "./iKline";
import { EnumExangeInfoFilterType, IExchangeInfo } from "./iExchangeInfo";
import { BuyOrder } from "../libs/orders/BuyOrder";
import { SellOrder } from "../libs/orders/SellOrder";
import { Wallet } from "./Wallet";

export class Symbol {
    private _candles: Observable<Candle[]> = new Observable<Candle[]>();
    private _exchangeInfo: IExchangeInfo;
    private _mms: number;
    private _mme: number;
    private _defaultKlineLimit: number;
    private _strategy: IStrategy;
    private _trigger: Observable<EnumStrategyResponse> = new Observable<EnumStrategyResponse>();
    private _orderRunning: boolean;

    //observable variables
    private _updateMetrics: Observable<boolean> = new Observable<boolean>();

    public static build = async (symbol:string, volume:number, priceChangePercent:number): Promise<Symbol> => {
        const newSymbol = new Symbol(symbol, volume, priceChangePercent);
        await newSymbol._getKlines();
        await newSymbol._getExcangeInfo();
        return newSymbol;
    }

    public get candles(): Candle[] {
        return this._candles.value;
    }

    public get candlesSize(): number {
        return this._candles.value.length;
    }

    public get exchangeInfo(): IExchangeInfo {
        return this._exchangeInfo;
    }

    public get triggerStatus() {
        return this._trigger.value;
    }

    public get mms(): number {
        return this._mms;
    }

    public get mme(): number {
        return this._mme;
    }

    public get openTime(): number {
        return this._candles.value[this.candlesSize - 1].openTime;
    }

    public setStrategy(strategyDefinition: IStrategyDefinition) {
        this._strategy = StrategyFactory.build(strategyDefinition);
    }

    //remove this from here
    public calculateMMS(range:number): number {
        const values = this._candles.value.map(candle => candle.closePrice);
        this._mms = CalculationFacade.mms(values, range).calc();
        // console.log(this.mms);
        return this.mms;
    }

    //remove this from here
    public calculateMME(range:number): number {
        const values = this._candles.value.map(candle => candle.closePrice);
        this._mme = CalculationFacade.mme(values, range).calc();
        // console.log(this.mme);
        return this.mme;
    }

    public updateCandles(kline:ISocketKline|IKline) {
        const candle = new Candle(kline, this.symbol);
        if(this._candles.value.length === this._defaultKlineLimit) this._candles.value.shift();
        this._candles.value.push(candle);
        this._candles.value = this._candles.value;
    }

    private constructor(
        public symbol:string, 
        public volume:number, 
        public priceChangePercent:number) {
            this._defaultKlineLimit = 25;
            this._updateMetrics.value = false;
            this._observers();
    }

    private async _getKlines() {
        const klines = await ApiHelper.getInstance().getLatestKlines(this.symbol, '1m', this._defaultKlineLimit);
        this._candles.value = klines.map(kline => new Candle(kline, this.symbol));
    }

    private async _getExcangeInfo() {
        this._exchangeInfo = await ApiHelper.getInstance().getExchangeInfo([ this.symbol ]);
    }

    private _observers() {
        this._candles.subscribe(candles => {
            if(!this._strategy) return;
            const closePrices = candles.map(candle => candle.closePrice);
            this._trigger.value = this._strategy.runTrigger(closePrices);
        });

        this._trigger.subscribe(status => {
            if(this._orderRunning) return;
            this._orderRunning = true;
            const filter = this._exchangeInfo.symbols[0].filters.find(filter => filter.filterType == EnumExangeInfoFilterType.MIN_NOTIONAL)!;

            if(status === EnumStrategyResponse.BUY) {

                Promise.resolve(new BuyOrder(this.symbol, parseFloat(filter.minNotional!))
                    .newOrder()
                    .then(_ => {
                        this._orderRunning = false;
                        Wallet.getInstance().updateWallet(_ => true);
                    }));

            } else if(status === EnumStrategyResponse.SELL) { 
                Promise.resolve(new SellOrder(this.symbol, parseFloat(filter.minNotional!))
                    .setCurrentPrice(this._candles.value[this.candlesSize -1].closePrice)
                    .newOrder()
                    .then(_ => {
                        this._orderRunning = false;
                        Wallet.getInstance().updateWallet(_ => true);
                    }));
            
            }
        })
    }
}