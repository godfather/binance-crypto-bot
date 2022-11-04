export enum OrderSide {
    BUY = 'BUY',
    SELL = 'SELL'
}

export enum OrderTimeInForce {
    GTC = 'GTC',
    FOK = 'FOK',
    IOC = 'IOC'
}

export enum OrderType {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET',
    STOP_LOSS = 'STOP_LOSS',
    STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
    TAKE_PROFIT = 'TAKE_PROFIT',
    TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
    LIMIT_MAKER = 'LIMIT_MAKER'
}

export enum OrderStatus {
    FILLED = "FILLED",
    NEW = "NEW",
    PARTIALLY_FILLED = "PARTIALLY_FILLED",
    CANCELED = "CANCELED",
    PENDING_CANCEL = "PENDING_CANCEL",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}

export interface OrderFill {
    price:string|number;
    qty:string|number;
    commission:string;
    commissionAsset:string;
    tradeId:number;
}

export interface OrderResponse {
    symbol:string;
    orderId:number;
    orderListId:number;
    clientOrderId:string;
    transactTime:number;
    price:string;
    origQty:string|number;
    executedQty:string|number;
    cummulativeQuoteQty:string|number;
    status:OrderStatus;
    timeInForce:OrderTimeInForce;
    type:OrderType;
    side:OrderSide;
    fills: OrderFill[];
    averagePrice?:number;
    sold?:boolean;
}

export type OrderParams = {
    symbol:string;
    side:OrderSide;
    type:OrderType;
    quantity?:number;
    quoteOrderQty?:number;
    timestamp:number;
}