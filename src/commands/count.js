import fs from 'node:fs';
import path from 'node:path';

export async function handleCount(args, currentDir) {
    if (args.length !== 2 || args[0] !== '--input') {
        console.log('Invalid input');
        return;
    }

    const filePath = path.resolve(currentDir, args[1]);

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        console.log('Operation failed');
        return;
    }

    let lines = 0;
    let words = 0;
    let chars = 0;

    const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    
    let leftover = '';

    readStream.on('data', chunk => {
        chars += chunk.length;
        const text = leftover + chunk.toString();
        const parts = text.split(/\s+/);
        leftover = parts.pop();
        lines += (chunk.match(/\n/g) || []).length;
        words += parts.filter(Boolean).length;
    });
    await new Promise((resolve, rejects) => {
        readStream.on('end', () => {
        if (leftover.trim()) words++;
         resolve();
        });
        readStream.on('error', rejects);
    })
    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${chars}`);
}