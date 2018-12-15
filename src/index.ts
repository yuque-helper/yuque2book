#!/usr/bin/env node

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as debug from 'debug';
import * as program from 'commander';

import yuque2book from './lib/index';

const log = debug('yuque2book');


const pkg = require('../package.json');

program.version(pkg.version)
       .option('-t, --token <n>', 'your yuque token 你的语雀token')
       .option('-l, --local ', 'to localize image and attach')
       .parse(process.argv);


const bookUrl = program.args[0];

let token = program.token;

try{
  const configPath = path.join(os.homedir(),'.yuque2book.json');
  const json =  JSON.parse(fs.readFileSync(configPath).toString());
  token = token || json.token;
} catch(e){
  log('[NO CONFIG]', e);
}

if(!bookUrl || !token){
  console.warn('[waring] program need token & book url, but get url %s, token %s', bookUrl, program.token);
  process.exit(0);
}

yuque2book(token, bookUrl, program.local);

