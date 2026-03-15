import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { parseArgs } from '../utils/argParser.js';

export async function handleDecrypt(args, currentDir) {

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

        const stat = fs.statSync(input);
        const fileSize = stat.size;

        if (fileSize < 44) {
            console.log('Operation failed');
            return;
        }

        const fd = fs.openSync(input, 'r');

        const salt = Buffer.alloc(16);
        const iv = Buffer.alloc(12);
        const authTag = Buffer.alloc(16);

        fs.readSync(fd, salt, 0, 16, 0);
        fs.readSync(fd, iv, 0, 12, 16);
        fs.readSync(fd, authTag, 0, 16, fileSize - 16);

        fs.closeSync(fd);

        const key = crypto.scryptSync(opts.password, salt, 32);

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        const inputStream = fs.createReadStream(input, {
            start: 28,
            end: fileSize - 17
        });

        const outputStream = fs.createWriteStream(output);

        await pipeline(
            inputStream,
            decipher,
            outputStream
        );

    } catch {
        console.log('Operation failed');
    }
}