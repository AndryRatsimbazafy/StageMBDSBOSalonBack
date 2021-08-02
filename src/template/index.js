function getArgs () {
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach( arg => {
            // long arg
            if (arg.slice(0,2) === '--') {
                const longArg = arg.split('=');
                const longArgFlag = longArg[0].slice(2,longArg[0].length);
                const longArgValue = longArg.length > 1 ? longArg[1] : true;
                args[longArgFlag] = longArgValue;
            }
            // flags
            else if (arg[0] === '-') {
                const flags = arg.slice(1,arg.length).split('');
                flags.forEach(flag => {
                    args[flag] = true;
                });
            }
        });
    return args;
}

const args = getArgs()
const fs = require('fs');
const _ = require('lodash');
const chalk = require('chalk');
const log = console.log;

const controller  = require('./template.controller')
const model = require('./template.model')
const router = require('./template.router')


if(args['component']){
    const name = args['component'];

    if (args['c']){
        fs.mkdirSync(`${process.cwd()}/src/controllers`, { recursive: true });
        fs.writeFileSync(`${process.cwd()}/src/controllers/${_.capitalize(name)}Controller.ts`, controller(name))
        log(`src/controllers/${_.capitalize(name)}Controller.ts ...........${chalk.green('generated')}`)
    }

    if (args['m']){
        fs.mkdirSync(`${process.cwd()}/src/models`, { recursive: true });
        fs.writeFileSync(`${process.cwd()}/src/models/${_.lowerCase(name)}.ts`, model(name))
        log(`src/models/${_.lowerCase(name)}.ts ...........${chalk.green('generated')}`)
    }

    if (args['r']) {
        fs.mkdirSync(`${process.cwd()}/src/router`, { recursive: true });
        fs.writeFileSync(`${process.cwd()}/src/router/${_.capitalize(name)}Router.ts`, router(name))
        log(`src/router/${_.capitalize(name)}Router.ts ...........${chalk.green('generated')}`)
    }

}