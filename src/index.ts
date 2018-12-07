#!/usr/bin/env node

import * as program from 'commander';
import yuque2book from './lib/index';

const pkg = require('../package.json');

program.version(pkg.version)
       .option('-t, --token <n>', 'your yuque token 你的语雀token')
       .option('-l, --local ', 'to localize image and attach')
       .parse(process.argv);


const bookUrl = program.args[0];

if(!bookUrl || !program.token){
  console.warn('[waring] program need token & book url, but get url %s, token %s', bookUrl, program.token);
  process.exit(0);
}

yuque2book(program.token, bookUrl, program.local);

