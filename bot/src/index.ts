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

    // const socket = new CryptoBot(`${process.env.WS_URI!}/btcbusd@kline_1m`, wallet);
    // const socket = new CryptoBot(`wss://testnet.binance.vision/stream?streams=btcbusd@kline_1m/ethbusd@kline_1m/ltcbusd@kline_1m`, wallet);
    const socket = new CryptoBot(process.env.WS_URI!, wallet);
    // socket.run();
    socket.onCryptoListChange();
})

// ----------- //

// ApiHelper.getInstance(true).getWalletInfo().then((response) => {
//     console.log(response);
// });

// ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.SELL, OrderType.MARKET, 0.01).then((response) => {
//     console.log(response);
// }).catch(e => console.log(e));

// ApiHelper.getInstance(true).newOrder('BTCUSDT', OrderSide.BUY, OrderType.MARKET, buyAumont).then((response) => {
//     console.log(response);

//     ApiHelper.getInstance(true).getWalletInfo().then((response) => {
//         console.log(response);
//     });    
// }).catch(e => console.log(e));


// (async () => {
//     orders.push(await ApiHelper.getPrivateInstance().newOrder('BTCUSDT', OrderSide.SELL, OrderType.MARKET, 0.19));
//     let wallet:WalletBase = new WalletBase(
//         WalletBase.walletLimit(process.env.WALLET_LIMIT!),
//         await WalletBase.loadExternalWallet()
//     );
//     console.log(wallet.status);
    
//     wallet.updateAsset('USDT', 5000.35, Operation.DEC);

//     console.log(wallet.status);

//     wallet.limitReached('USDT');

// })();
