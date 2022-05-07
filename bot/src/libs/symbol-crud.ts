import SymbolConfig from '../models/symbol-config';

export default class SymbolCrud {
    private static _instance:SymbolCrud;
    
    private constructor() {}

    public static getInstance() {
        if(this._instance) return this._instance;
        this._instance = new SymbolCrud();
        return this._instance;
    }

    public async create(symbol:string, aumont:number) {
        const exists = await SymbolConfig.findOne({ symbol:symbol });
        if(exists) return console.log(`${symbol} Can't be created, the symbol areeady exists!`)        
        
        const result = await SymbolConfig.create({symbol, aumont});
        return console.log(`${result._id} SAVED`);       
    }

    public async update(symbol:string, aumont:number) {
        const result = await SymbolConfig.findOneAndUpdate(
            { symbol:symbol }, 
            { aumont:aumont }, 
            { new:true, upsert:true}
        );

        return console.log(`${result._id} SAVED`);
    }

    public async delete(symbol:string) {
        const result = await SymbolConfig.deleteOne({symbol});
        console.log(`${result.deletedCount} DELETED`);
    }

    public async list() {
        const result = await SymbolConfig.find({});
        const data = result.map(doc => doc.toObject());
        console.table(data);
    }
}