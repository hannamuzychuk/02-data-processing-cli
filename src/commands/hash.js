import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseArgs } from '../utils/argParser.js';

export async function handleHash(args, currentDir) {
    const opts = parseArgs(args);

    if (!opts.input) {
        console.log('Invalid input');
        return;
    }
    const algorithm = opts.algorithm || 'sha256';
    const supported = ['sha256', 'md5', 'sha512'];
    if (!supported.includes(algorithm)) {
        console.log('Operation failed');
        return;
    }

    const filePath = path.resolve(currentDir, opts.input)

    if (!fs.existsSync(filePath)) {
        console.log('Operation failed');
        return;
    }

    try {
    const hash = crypto.createHash(algorithm);
    const readStream = fs.createReadStream(filePath);

    readStream.on('data', chunk => {
        hash.update(chunk);
    });

    readStream.on('end', () => {
        const result = hash.digest('hex');
        console.log(`${algorithm}: ${result}`);

        if (opts.save) {

                const savePath = `${filePath}.${algorithm}`;

                fs.writeFileSync(savePath, result);
            }
    });

     readStream.on('error', () => {
            console.log('Operation failed');
        });

    } catch {
        console.log('Operation failed');
    }
}