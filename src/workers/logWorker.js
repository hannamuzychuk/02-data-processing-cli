import fs from 'node:fs';
import readline from 'node:readline';
import { workerData, parentPort } from 'node:worker_threads';

const { input, start, end } = workerData;

const levels = {};
const status = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 };
const paths = {};
let total = 0;
let responseSum = 0;

try {
  const stream = fs.createReadStream(input, { start, end });
  const rl = readline.createInterface({ input: stream });

  rl.on('line', line => {
    try {
      if (!line.trim()) return;
      const parts = line.trim().split(/\s+/);
      if (parts.length < 7) return;

      const level = parts[1];
      const statusCode = Number(parts[3]);
      const responseTime = Number(parts[4]);
      const pathStr = parts[6];

      total++;
      responseSum += responseTime;

      levels[level] = (levels[level] || 0) + 1;

      const cls = Math.floor(statusCode / 100) + 'xx';
      if (status[cls] !== undefined) status[cls]++;

      paths[pathStr] = (paths[pathStr] || 0) + 1;
    } catch (err) {
      console.error('Worker line parse error:', err.message, 'Line:', line);
    }
  });

  rl.on('close', () => {
    parentPort.postMessage({ total, levels, status, paths, responseSum });
  });

  rl.on('error', err => {
    parentPort.postMessage({ error: err.message });
  });
} catch (err) {
  parentPort.postMessage({ error: err.message });
}