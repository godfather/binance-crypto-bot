export interface IExchangeInfo {
    timezone:string;
    serverTime:number;
    rateLimits: RateLimitType[];  
    exchangeFilters:any[];
    symbols:IExangeInfoSymbol[];
}

interface IExangeInfoSymbol { 
    symbol:string;
    status:string;
    baseAsset:string;
    baseAssetPrecision:number;
    quoteAsset:string;
    quotePrecision:number;
    quoteAssetPrecision:number;
    baseCommissionPrecision:number;
    quoteCommissionPrecision:number;
    orderTypes:string[];
    icebergAllowed:boolean;
    ocoAllowed:boolean;
    quoteOrderQtyMarketAllowed:boolean;
    allowTrailingStop:boolean;
    isSpotTradingAllowed:boolean;
    isMarginTradingAllowed:boolean;
    filters:ExchangeFilterType[];
    permissions: string[];
}

type RateLimitType = {
    rateLimitType: EnumRateLimitType;
    interval: EnumRateLimitInterval;
    intervalNum:number;
    limit:number;
}


type ExchangeFilterType = {
    filterType:EnumExangeInfoFilterType;
    minPrice?:string;
    maxPrice?:string;
    tickSize?:string;
    multiplierUp?:string;
    multiplierDown?:string;
    avgPriceMins?:number;
    minQty?:string;
    maxQty?:string;
    stepSize?:string;
    minNotional?:string;
    applyToMarket?:boolean;
    limit?:number;
    minTrailingAboveDelta?:number;
    maxTrailingAboveDelta?:number;
    minTrailingBelowDelta?:number;
    maxTrailingBelowDelta?:number;
    maxNumOrders?:number;
    maxNumAlgoOrders?:number;
}

export enum EnumRateLimitType {
    REQUEST_WEIGHT = 'REQUEST_WEIGHT',
    ORDERS = 'ORDERS'
}

export enum EnumRateLimitInterval {
    SECOND = 'SECOND',
    MINUTE = 'MINUTE',
    HOUR = 'HOUR',
    DAY = 'DAY'
}

export enum EnumExangeInfoFilterType {
    PRICE_FILTER = 'PRICE_FILTER',
    PERCENT_PRICE = 'PERCENT_PRICE',
    LOT_SIZE = 'LOT_SIZE',
    MIN_NOTIONAL = 'MIN_NOTIONAL',
    ICEBERG_PARTS = 'ICEBERG_PARTS',
    MARKET_LOT_SIZE = 'MARKET_LOT_SIZE',
    TRAILING_DELTA = 'TRAILING_DELTA',
    MAX_NUM_ORDERS = 'MAX_NUM_ORDERS',
    MAX_NUM_ALGO_ORDERS = 'MAX_NUM_ALGO_ORDERS'
}
