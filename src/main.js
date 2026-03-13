import os from 'os';
import {startRepl} from './repl.js';

console.log('Welcome to Data Processing CLI!');

let currentDir = os.homedir();
console.log(`You are currently in ${currentDir}`);

startRepl(currentDir);