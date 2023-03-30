import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export abstract class BaseHttpClient {
    protected readonly instance:AxiosInstance;
    
    public constructor(baseURL:string, privateCall=true) {
        this.instance = axios.create({ baseURL });
        this._initializeResponseInterceptor();        
        if(privateCall) this._initializeRequestInterceptor();
    }

    public errorHandler(error:any) {
        console.log(`ERROR URI: ${JSON.stringify(error.config.url)}`);

        if(error.response) {
            console.log('ERROR RESPONSE: Request made and server responded with an error!');
            console.log(`ERROR STATUS: ${error.response.status}`);
            console.log(`ERROR HEADERS: ${JSON.stringify(error.response.headers)}`);
            console.log(`ERROR DATA: ${JSON.stringify(error.response.data)}`);
        } else if(error.request) {
            console.log('ERROR REQUEST: The request was made but no response was received!');
            console.log(`ERROR DATA: ${JSON.stringify(error.response.data)}`);
        } else {
            console.log('ERROR: Something happened in setting up the request that triggered an Error');
            console.log(`ERROR: ${error.message}`);
        }
        return Promise.reject('AXIOS REQUEST FAIL!');
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