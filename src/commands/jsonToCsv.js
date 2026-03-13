import path from 'node:path';
import { parseArgs } from '../utils/argParser.js';
import fs from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export async function handleJsonToCsv(args, currentDir) {
    const opts = parseArgs(args);
    if (!opts.input || !opts.output) {
        console.log('Invalid input');
        return;
    }

    const inputPath = path.resolve(currentDir, opts.input);
    const outputPath = path.resolve(currentDir, opts.output);

    if (!fs.existsSync(inputPath)) {
        console.log('Operation failed');
        return;
    }

    try {
        const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
        if (!Array.isArray(data) || data.length === 0) {
            fs.writeFileSync(outputPath, '');
            return;
        }

        const headers = Object.keys(data[0]);
        const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });

        writeStream.write(headers.join(',') + '\n');
        
        for (const obj of data) {
            const row = headers.map(h => obj[h] ?? '').join(',');
            writeStream.write(row + '\n');
        }

        writeStream.end();
    } catch {
        console.log('Operation failed');
    }
}