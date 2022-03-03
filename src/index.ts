import { ApiHelper } from "./libs/api";
import { CandleType } from "./types/candle-types";
import { AxiosResponse } from "axios";

// ApiHelper.getInstance().getLatestCandles('BTCBUSD').then((response) => {
//     console.log(response);
// });

ApiHelper.getInstance(true).getWalletInfo().then((response) => {
    console.log(response);
});