import 'dotenv/config';
import { CryptoBot } from './crypto-bot';
import { ApiHelper } from "./libs/api";
import { WalletBase } from "./models/wallet-mode";


//GETTING THE WALLET DATA
ApiHelper.getPrivateInstance().getWalletInfo().then(data => {
    const wallet = new WalletBase(
        WalletBase.walletLimit(process.env.WALLET_LIMIT!),
        WalletBase.loadExternalWallet(data)
    );    

    const socket = new CryptoBot(process.env.WS_URI!, wallet);
    socket.onCryptoListChange();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
