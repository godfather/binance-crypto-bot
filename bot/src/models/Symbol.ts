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
import { IOrder } from "./Order";

export class Symbol {
    private _exchangeInfo: IExchangeInfo;
    private _defaultKlineLimit: number;
    private _strategy: IStrategy;
    private _orderRunning: boolean;
    private _lastOpenTime: number;
    private _round: number; //how many rounds symbol is running;
    private _stagnedRounds: number;
    public _targetPrice: number;
    private _stopPrice: number;
    private _holding: boolean;

    //observable variables
    private _candles: Observable<Candle[]> = new Observable<Candle[]>();
    private _trigger: Observable<EnumStrategyResponse> = new Observable<EnumStrategyResponse>();
    private _updateMetrics: Observable<boolean> = new Observable<boolean>();
    private _currentOrder: Observable<IOrder|undefined> = new Observable<IOrder|undefined>();


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
            this._defaultKlineLimit = 100;
            this._updateMetrics.value = false;
            this._round = 0;
            this._stagnedRounds = 0;
            this._orderRunning = false;
            this._holding = false;
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
        // console.log('_getKlines ' + this.symbol);
        const klines = await ApiHelper.getInstance().getLatestKlines(this.symbol, '1m', this._defaultKlineLimit);
        // console.table(klines);

        this._candles.value = klines.map(kline => new Candle(kline, this.symbol));
        this._stopPrice = this._candles.value[this.candlesSize -1].closePrice;
        this._lastOpenTime = this._candles.value[this.candlesSize -1].openTime;
        this._targetPrice = this._getTarget();
        this._stopPrice = this._getStop();
    }

    private async _getExcangeInfo() {
        this._exchangeInfo = await ApiHelper.getInstance().getExchangeInfo([ this.symbol ]);
    }

    private _getTarget() {
        const candle = this.candles[this.candlesSize - 1];
        return candle.closePrice + (candle.size * 1.5);
    }

    private _getStop() {
        return this.candles[this.candlesSize - 1].lowPrice;
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
            this._lastOpenTime = this._candles.value[this.candlesSize -1].openTime;
            if(!this._strategy) return;
            const closePrices = candles.map(candle => candle.closePrice);
            this._round++;

            this._updateStagnedRoundCounter(closePrices);    
            
            if(!this._holding)  {
                this._targetPrice = this._getTarget();
                this._stopPrice = this._getStop();
            }

            this._trigger.value = this._strategy.runTrigger(candles, this._round, this._stopPrice, this._targetPrice, this._holding);
        });

        this._trigger.subscribe(status => {
            console.log(`PRICE: ${this.candles[this.candlesSize -1].closePrice}, LOW PRICE: ${this.candles[this.candlesSize -1].lowPrice}, TARGET: ${this._targetPrice}, STOP: ${this._stopPrice}`);

            if(this._orderRunning) return;
            this._orderRunning = true;
            const filter = this._exchangeInfo.symbols[0].filters.find(filter => filter.filterType == EnumExangeInfoFilterType.MIN_NOTIONAL)!;
            
            if(status === EnumStrategyResponse.BUY) {
                console.log(this.symbol + ' BUY ' + Date());

                if(Wallet.getInstance().getBalance() < (parseFloat(filter.minNotional!) * 2)) {
                    console.log('INSUFICIENT FUNDS ' + Wallet.getInstance().getBalance());
                    return;
                }

                this._holding = true; //move to order promise
                this._orderRunning = false;
                Promise.resolve(new BuyOrder(this.symbol, parseFloat(filter.minNotional!))
                    .newOrder()
                    .then(order => this._currentOrder.value = order)
                    .catch(response => {
                        this._orderRunning = false;
                        console.log(response);
                    })
                );
                
            } else if(status === EnumStrategyResponse.SELL) { 
                console.log(this.symbol + ' SELL ' + Date());
                // console.log(`MIN_NOTIONAL: ${filter.minNotional} executedQty: ${this._currentOrder.value!.executedQty}`);
                // this._targetPrice = this._getTarget();
                // this._stopPrice = this._getStop();
                this._holding = false; //move to order promise
                this._orderRunning = false;
                Promise.resolve(new SellOrder(this.symbol, parseFloat(this._currentOrder.value!.executedQty.toString()))
                    .newOrder()
                    .then(_ => this._currentOrder.value = undefined)
                    .catch(response => {
                        this._orderRunning = false;
                        console.log(response);
                    })
                    // .then(_ => {
                    //     this._orderRunning = false;
                    //     this._targetPrice = this._getTarget();
                    //     Wallet.getInstance().updateWallet(_ => true);
                    // })
                );            
            } else {
                this._orderRunning = false;
            }
        })

        this._currentOrder.subscribe(_ => {
            this._orderRunning = false;
            Wallet.getInstance().updateWallet(_ => true);
        });
    }
}