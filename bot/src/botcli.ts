import { Command } from 'commander';
import 'dotenv/config';
import SymbolConfig from './models/symbol-config';
import SymbolCrud from './libs/symbol-crud';

interface SymbolOptions {
    operation:string;
    symbol:string;
    aumont:number;
    stable:string;
}

const cli = new Command();

cli.command('symbol')
    .description('add a new symbol to collection if not exists')
    .requiredOption('-o, --operation <string>', 'the operation, eg: c = create, r = read, u = update, d = delete')
    .option('-s, --symbol <string>', 'symbol string, eg: BTC')
    .option('-a, --aumont <decimal>', 'aumont, eg: 10.33')
    .option('-S, --stable <string>', 'the stable coin used on operation')
    .action(async (options:SymbolOptions) => {
        if(options.operation === 'r')  await SymbolCrud.getInstance().list()
        

        if(options.operation === 'c' && (options.symbol && options.aumont)) {
            const stable = options.stable || 'USDT'
            await SymbolCrud.getInstance().create(options.symbol, options.aumont);
        }

        if(options.operation === 'u' && (options.symbol && options.aumont)) {
            await SymbolCrud.getInstance().update(options.symbol, options.aumont);
        }

        if(options.operation === 'd' && options.symbol) {
            await SymbolCrud.getInstance().delete(options.symbol);
        }

        process.exit();
    });

cli.parse(process.argv);
