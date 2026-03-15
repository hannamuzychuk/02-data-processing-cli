import fs from 'node:fs';
import { workerData, parentPort } from 'node:worker_threads';

const { input, start, end } = workerData;

const levels = {};
const status = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 };
const paths = {};

let total = 0;
let responseSum = 0;

const stream = fs.createReadStream(input, {
    start,
    end
});

let buffer = '';

stream.on('data', chunk => {
    buffer += chunk.toString();

    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {

        if (!line.trim()) continue;

        const parts = line.split(' ');

        const level = parts[1];
        const statusCode = Number(parts[3]);
        const responseTime = Number(parts[4]);
        const path = parts[6];

        total++;
        responseSum += responseTime;

        levels[level] = (levels[level] || 0) + 1;

        const cls = Math.floor(statusCode / 100) + 'xx';
        if (status[cls] !== undefined) {
            status[cls]++;
        }

        paths[path] = (paths[path] || 0) + 1;
    }
});

stream.on('end', () => {

    parentPort.postMessage({
        total,
        levels,
        status,
        paths,
        responseSum
    });
});