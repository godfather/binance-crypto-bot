export interface IBalance {
    asset:string;
    free:string;
    locked:string;
}

export interface IWallet {
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
    balances: IBalance[];
}
