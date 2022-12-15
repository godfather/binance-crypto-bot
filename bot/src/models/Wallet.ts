import { ApiHelper } from "../api/api";
import { IWallet } from "./iWallet";

export type WalletCallback = (iwallet:IWallet) => void;

export class Wallet {
    private static _instance: Wallet;
    public status: IWallet;
    public walletUpdatedAt: number;
    private _walletUpdating: boolean;


    //singleton
    private constructor() {}

    public static getInstance(iwallet?: IWallet): Wallet {
        if(!this._instance) {
            this._instance = new Wallet();
            this._instance._setStatus(iwallet!);
        }
        return this._instance;
    }

    public updateWallet(callback:WalletCallback): void {
        if(this._walletUpdating) return;
        this._walletUpdating = true;
        ApiHelper.getPrivateInstance().getWalletInfo()
            .catch(console.log)
            .then(response => {
                this._setStatus(response!);
                this._walletUpdating = false;
                callback(response!);
            });
    }

    private _setStatus(data:IWallet): void {
        this.status = data;
        this.walletUpdatedAt = Date.now();
    }
}