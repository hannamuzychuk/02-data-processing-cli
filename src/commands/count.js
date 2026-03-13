import fs, { read } from 'node:fs';
import path from 'node:path';

export async function handleCount(args, currentDir) {
    if (args.length !== 2 || args[0] !== '--input') {
        cpnsole.log('Invalid input');
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

    readStream.on('data', chunk => {
        chars += chunk.length;
        lines += chunk.split("\n").length - 1;
        words += chunk.split(/\s+/).filter(Boolean).length;
    });
    await new Promise((resolve, rejects) => {
        readStream.on('end', resolve);
        readStream.on('error', rejects);
    })
    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${chars}`);
}