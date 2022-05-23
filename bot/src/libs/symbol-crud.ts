import Symbol from '../models/symbol-config';

export default class SymbolCrud {
    private static _instance:SymbolCrud;
    
    private constructor() {}

    public static getInstance() {
        if(this._instance) return this._instance;
        this._instance = new SymbolCrud();
        return this._instance;
    }

    public async create(symbol:string, aumont:number, stable='USDT') {
        const exists = await Symbol.findOne({ symbol:symbol });
        if(exists) return console.log(`${symbol} Can't be created, the symbol areeady exists!`)        
        
        const result = await Symbol.create({symbol, aumont, stable});
        return console.log(`${result._id} SAVED`);       
    }

    public async update(symbol:string, aumont=0.00, profit=0.05) {        
        const result = await Symbol.findOneAndUpdate(
            { symbol:symbol },
            { $inc:{ aumont:aumont }, profit:profit},
            { new:true, upsert:true }
        );

        return console.log(`${result._id} SAVED`);
    }

    public async delete(symbol:string) {
        const result = await Symbol.deleteOne({symbol});
        console.log(`${result.deletedCount} DELETED`);
    }

    public async list() {
        const result = await Symbol.find({}, { projection:{ __v:0 }});
        const data = result.map(doc => doc.toObject());
        console.table(data);
    }
}