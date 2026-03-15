import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseArgs } from '../utils/argParser.js';

function calculateHash(filePath, algorithm) {

    return new Promise((resolve, reject) => {

        const hash = crypto.createHash(algorithm);
        const readStream = fs.createReadStream(filePath);

        readStream.on('data', chunk => hash.update(chunk));

        readStream.on('end', () => {
            resolve(hash.digest('hex'));
        });

        readStream.on('error', reject);
    });
}

export async function handleHashCompare(args, currentDir) {

    const opts = parseArgs(args);

    if (!opts.input || !opts.hash) {
        console.log('Invalid input');
        return;
    }

    const algorithm = (opts.algorithm || 'sha256').toLowerCase();
    const supported = ['sha256', 'md5', 'sha512'];

    if (!supported.includes(algorithm)) {
        console.log('Operation failed');
        return;
    }

    const inputPath = path.resolve(currentDir, opts.input);
    const hashPath = path.resolve(currentDir, opts.hash);

    if (!fs.existsSync(inputPath) || !fs.existsSync(hashPath)) {
        console.log('Operation failed');
        return;
    }

    try {

        const calculatedHash = await calculateHash(inputPath, algorithm);

        const expectedHash = fs.readFileSync(hashPath, 'utf-8')
            .trim()
            .toLowerCase();

        if (calculatedHash.toLowerCase() === expectedHash) {
            console.log('OK');
        } else {
            console.log('MISMATCH');
        }

    } catch {
        console.log('Operation failed');
    }
}