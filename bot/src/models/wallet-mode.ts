import { ApiHelper } from "../libs/api";
import { Ballance, Wallet } from "../types/wallet-types";

type WalletOption = (w:WalletBase) => void;

export enum Operation {
    'INC' = 'INCREASE',
    'DEC' = 'DECREASE'
};

export class WalletBase {
    private _wallet:Wallet;
    private _currentWallet:Wallet;
    private _expendLimit:number;

    constructor(...options:WalletOption[])  {
        options.forEach(option => option(this))
        this._currentWallet = this._wallet;
    }
    
    get status():Wallet {
        return this._currentWallet;
    }

    get initialStatus():Wallet {
        return this._wallet;
    }

    public limitReached(symbol:string):boolean {
        const asset:Ballance = this._wallet.balances[this._getAssetIndex(symbol, this._wallet.balances)];
        const currentAsset:Ballance = this._currentWallet.balances[this._getAssetIndex(symbol, this._currentWallet.balances)];
        const assetInitialValue = parseFloat(asset.free);
        const assetCurrentValue = parseFloat(currentAsset.free);

        let diffRate = 0;

        if(assetCurrentValue > assetInitialValue) diffRate = ((assetCurrentValue - assetInitialValue) * 100) / assetInitialValue;
        else diffRate = ((assetCurrentValue * 100) / assetInitialValue) - 100;

        return diffRate <= this._expendLimit;
    }

    public updateAsset(symbol:string, aumont:number, operation:Operation):void {
        const assetIndex = this._getAssetIndex(symbol, this._currentWallet.balances);
        const asset:Ballance = this._currentWallet.balances[assetIndex];
        const assetValue = parseFloat(asset.free);
        asset.free = (operation === Operation.INC ? assetValue + aumont : assetValue - aumont).toString();  
    }


    private _getAssetIndex(symbol:string, balances:Ballance[]):number {
        return balances.findIndex(ballance => ballance.asset === symbol)!;
    }

    public static walletLimit(limit:string|number):WalletOption {
        return (w:WalletBase):void => { w._expendLimit = parseFloat(`${limit}`) }
    }

    public static loadExternalWallet(wallet:Wallet):WalletOption {
        return (w:WalletBase):void => { w._wallet = wallet; }
    }

    // public static async loadExternalWallet():Promise<WalletOption> {
    //     const data = await ApiHelper.getPrivateInstance().getWalletInfo();
    //     return (w:WalletBase):void => { w._wallet = data; }
    // }
}