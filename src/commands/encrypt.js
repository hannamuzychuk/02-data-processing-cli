import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { parseArgs } from '../utils/argParser.js';

export async function handleEncrypt(args, currentDir) {

    const opts = parseArgs(args);

    if (!opts.input || !opts.output || !opts.password) {
        console.log('Invalid input');
        return;
    }

    const input = path.resolve(currentDir, opts.input);
    const output = path.resolve(currentDir, opts.output);

    if (!fs.existsSync(input)) {
        console.log('Operation failed');
        return;
    }

    try {
    
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(12);
        const key = crypto.scryptSync(opts.password, salt, 32);


    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const inputStream = fs.createReadStream(input);
    const outputStream = fs.createWriteStream(output);

        outputStream.write(salt);
        outputStream.write(iv);

        await pipeline(
            inputStream,
            cipher,
            outputStream
        );

        const authTag = cipher.getAuthTag();
        fs.appendFileSync(output, authTag);

    } catch {
    console.log('Operation failed');
}
}