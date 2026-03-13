import path from 'node: path';

export function resolvePath(currentDir, p) {
    return path.resolve(currentDir, p);
}