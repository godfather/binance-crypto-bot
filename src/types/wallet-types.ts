export interface Ballance {
    asset:string;
    free:string;
    locked:string;
}

export interface Wallet {
    permissions:string;
    makerCommission:number;
    takerCommission:number;
    buyerCommission:number;
    sellerCommission:number;
    canTrade:boolean;
    canWithdraw:boolean;
    canDeposit:boolean;
    updateTime:number;
    accountType:string;
    balances: Ballance[];
}
