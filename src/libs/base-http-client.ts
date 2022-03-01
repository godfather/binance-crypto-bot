import axios, { AxiosInstance, AxiosResponse } from "axios";

declare module 'axios' {
    export interface AxiosResAxiosPromiseponse<T=any> extends Promise<T>{}
}

export abstract class BaseHttpClient {
    protected readonly instance:AxiosInstance;
    
    public constructor(baseURL:string) {
        this.instance = axios.create({ baseURL });
        this._initializeResponseInterceptor();
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
}