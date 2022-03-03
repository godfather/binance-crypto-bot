import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export abstract class BaseHttpClient {
    protected readonly instance:AxiosInstance;
    
    public constructor(baseURL:string, privateCall=false) {
        this.instance = axios.create({ baseURL });
        this._initializeResponseInterceptor();
        if(privateCall) this._initializeRequestInterceptor();
    }

    private _initializeResponseInterceptor() {
        this.instance.interceptors.response.use(
            this._responseHandler,
            this._errorHandler
        );
    }

    private _responseHandler({ data }:AxiosResponse) {     
        return data;
    }

    private _errorHandler(error:any):Promise<any> {
        return Promise.reject(error);
    }

    private _initializeRequestInterceptor() {
        this.instance.interceptors.request.use(
            this._requestHandler,
            this._errorHandler
        );
    }

    private _requestHandler(config:AxiosRequestConfig) {
        config.headers!['X-MBX-APIKEY'] = process.env.API_KEY!;
        return config;
    }
}