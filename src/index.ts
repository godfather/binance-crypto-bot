import { ApiHelper } from "./libs/api";
import { CandleType } from "./types/candle-types";
import { AxiosResponse } from "axios";

const api = new ApiHelper();

api.getLatestCandles('BTCBUSD').then((response) => {
    console.log(response);
});