import { ApiHelper } from "../api/api";
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
    private _exchangeInfo: IExchangeInfo;
    private _defaultKlineLimit: number;
    private _strategy: IStrategy;
    private _orderRunning: boolean;
    private _lastOpenTime: number;
    private _stopPrice: number;
    private _round: number; //how many rounds symbol is running;
    private _stagnedRounds: number;
    private _target: number;
    
    //observable variables
    private _candles: Observable<Candle[]> = new Observable<Candle[]>();
    private _trigger: Observable<EnumStrategyResponse> = new Observable<EnumStrategyResponse>();
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

    public get lastOpenTime(): number {
        return this._lastOpenTime;
    }

    public get stopPrice(): number {
        return this._stopPrice;
    }

    public get exchangeInfo(): IExchangeInfo {
        return this._exchangeInfo;
    }

    public get triggerStatus() {
        return this._trigger.value;
    }

    public get openTime(): number {
        return this._candles.value[this.candlesSize - 1].openTime;
    }

    public get round(): number {
        return this._round;
    }

    public get stagnedRouds(): number {
        return this._stagnedRounds;
    }
    
    private constructor(
        public symbol:string, 
        public volume:number, 
        public priceChangePercent:number) {
            this._defaultKlineLimit = 25;
            this._updateMetrics.value = false;
            this._round = 0;
            this._stagnedRounds = 0;
            this._orderRunning = false;
            this._observers();
    }

    public setStrategy(strategyDefinition: IStrategyDefinition) {
        this._strategy = StrategyFactory.build(strategyDefinition);
    }    

    public updateCandles(kline:ISocketKline|IKline): void {
        const candle = new Candle(kline, this.symbol);
        if(this._candles.value.length === this._defaultKlineLimit) this._candles.value.shift();
        this._candles.value.push(candle);
        this._candles.value = this._candles.value;
    }    

    public stopSymbolBot(): Promise<void> {
        this._trigger.value = EnumStrategyResponse.SELL;
        return new Promise<void>(resolve => resolve());
    }    

    private async _getKlines() {
        console.log('_getKlines ' + this.symbol);
        const klines = await ApiHelper.getInstance().getLatestKlines(this.symbol, '1m', this._defaultKlineLimit);
        console.table(klines);

        this._candles.value = klines.map(kline => new Candle(kline, this.symbol));
        this._stopPrice = this._candles.value[this.candlesSize -1].closePrice;
        this._lastOpenTime = this._candles.value[this.candlesSize -1].openTime;
        this._target = this._getTarget();
    }

    private async _getExcangeInfo() {
        this._exchangeInfo = await ApiHelper.getInstance().getExchangeInfo([ this.symbol ]);
    }

    private _getTarget() {
        const candle = this.candles[this.candlesSize - 1];
        const diff = candle.closePrice - candle.openPrice;
        const target = diff <= 0 ? (candle.closePrice + (candle.closePrice * 0.05)) : (diff * 3) + candle.closePrice;
        console.log(`UPDATE TARGET ${this.symbol}: T = ${target}; CP = ${candle.closePrice}; OP = ${candle.openPrice}; DIFF = ${diff}`);
        return target;
    }

    private _updateStagnedRoundCounter(closePrices: number[]): number {
        const currentClosePrice = closePrices[closePrices.length -1];
        const lastClosePrice = closePrices[closePrices.length -2];
        if(currentClosePrice === lastClosePrice) return this._stagnedRounds++;
        return this._stagnedRounds = 0;

    }

    private _observers() {
        this._candles.subscribe(candles => {
            console.log(this.symbol + ' CANDLES UPDATED');
            if(!this._strategy) return;
            const closePrices = candles.map(candle => candle.closePrice);
            this._round++;

            this._updateStagnedRoundCounter(closePrices);

            this._trigger.value = this._strategy.runTrigger(closePrices, this._round, this._target);
        });

        this._trigger.subscribe(status => {
            console.log(`STATUS: ${status}, ORDER RUNNIN: ${this._orderRunning}`);

            if(this._orderRunning) return;
            this._orderRunning = true;
            const filter = this._exchangeInfo.symbols[0].filters.find(filter => filter.filterType == EnumExangeInfoFilterType.MIN_NOTIONAL)!;
            
            if(status === EnumStrategyResponse.BUY) {
                console.log(this.symbol + ' BUY');
                
                Promise.resolve(new BuyOrder(this.symbol, parseFloat(filter.minNotional!))
                    .newOrder()
                    .then(_ => {
                        this._orderRunning = false;
                        Wallet.getInstance().updateWallet(_ => true);
                    })
                    .catch(response => {
                        this._orderRunning = false;
                        console.log(response);
                    })
                );
                
            } else if(status === EnumStrategyResponse.SELL) { 
                console.log(this.symbol + ' SELL');
                Promise.resolve(new SellOrder(this.symbol, parseFloat(filter.minNotional!))
                    .setCurrentPrice(this._candles.value[this.candlesSize -1].closePrice)
                    .newOrder()
                    .then(_ => {
                        this._orderRunning = false;
                        this._target = this._getTarget();
                        Wallet.getInstance().updateWallet(_ => true);
                    })
                    .catch(response => {
                        this._orderRunning = false;
                        console.log(response);
                    })
                );            
            } else {
                this._orderRunning = false;
            }
        })
    }
}