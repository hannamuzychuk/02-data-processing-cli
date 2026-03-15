import path from 'node:path';
import { parseArgs } from '../utils/argParser.js';
import fs from 'node:fs';
import { Transform, PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}
export async function handleCsvToJson(args, currentDir) {
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
    let headers = null;
    let isFirstLine = true;
    let firstObj = true;
    let leftover = '';

    const transform = new Transform({
        readableObjectMode: false,
        writableObjectMode: false,
        transform(chunk, _, callback) {
            const data = chunk.toString();
            const text = leftover + chunk.toString();
            const lines = text.split(/\r?\n/);
            let out = '';

            for (let line of lines) {
                if (!line.trim()) continue;
                if (isFirstLine) {
                    headers = parseCSVLine(line);
                    isFirstLine = false;
                    out += '[';
                } else {
                    const values =  parseCSVLine(line);
                    const obj = {};
                    headers.forEach((h, i) => obj[h] = values[i] ?? '');
                    if (!firstObj) out += ',';
                    out += JSON.stringify(obj);
                    firstObj = false;
                }
            }
            callback(null, out);
        },
        flush(callback) {
            if (leftover.trim()) {
                const values = parseCSVLine(leftover);
                const obj = {};
                headers.forEach((h, i) => obj[h] = values[i] ?? '');
                if (!firstObj) this.push(',');
                this.push(JSON.stringify(obj));
            }
            this.push(']');
            callback();
        }
    });

    const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });

    try {
        await pipeline(
            fs.createReadStream(inputPath),
            transform,
            writeStream
        );

    } catch {
        console.log('Operation failed');
    }
}