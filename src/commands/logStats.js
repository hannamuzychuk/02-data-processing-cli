import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker } from 'node:worker_threads';
import { parseArgs } from '../utils/argParser.js';

export async function handleLogStats(args, currentDir) {
  const opts = parseArgs(args);

  if (!opts.input || !opts.output) {
    console.log('Invalid input');
    return;
  }

  const input = path.resolve(currentDir, opts.input);
  const output = path.resolve(currentDir, opts.output);


  if (!fs.existsSync(input)) {
    console.log('Operation failed: input file not found');
    return;
  }

  try {
    const fileSize = fs.statSync(input).size;
    const cpuCount = os.cpus().length;
    const chunkSize = Math.floor(fileSize / cpuCount) || fileSize;

    const workers = [];
    let start = 0;

    for (let i = 0; i < cpuCount; i++) {
      let end = (i === cpuCount - 1) ? fileSize - 1 : start + chunkSize - 1;
      if (end < start) end = start;

      const worker = new Worker(
        new URL('../workers/logWorker.js', import.meta.url),
        { workerData: { input, start, end } }
      );

      workers.push(worker);
      start = end + 1;
    }

    const results = await Promise.all(
      workers.map(worker =>
        new Promise((resolve, reject) => {
          worker.on('message', msg => {
            if (msg.error) reject(new Error(msg.error));
            else resolve(msg);
          });
          worker.on('error', reject);
          worker.on('exit', code => {
            if (code !== 0)
              console.error(`Worker stopped with exit code ${code}`);
          });
        })
      )
    );

    const final = {
      total: 0,
      levels: {},
      status: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
      topPaths: [],
      avgResponseTimeMs: 0
    };

    const pathCounts = {};
    let responseSum = 0;

    for (const r of results) {
      final.total += r.total;
      responseSum += r.responseSum;

      for (const lvl in r.levels) {
        final.levels[lvl] = (final.levels[lvl] || 0) + r.levels[lvl];
      }

      for (const st in r.status) {
        final.status[st] += r.status[st];
      }

      for (const p in r.paths) {
        pathCounts[p] = (pathCounts[p] || 0) + r.paths[p];
      }
    }

    final.avgResponseTimeMs = final.total > 0
      ? Number((responseSum / final.total).toFixed(2))
      : 0;

    final.topPaths = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([path, count]) => ({ path, count }));

    fs.writeFileSync(output, JSON.stringify(final, null, 2));
    console.log('Log stats generated successfully!');
  } catch (err) {
    console.error('Operation failed:', err.message);
  }
}