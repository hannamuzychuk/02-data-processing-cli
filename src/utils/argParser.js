export function parseArgs(args) {
    const opts = {};
    let currentKey = null;

    for (const arg of args) {
        if (arg.startsWith('--')) {
            currentKey = arg.slice(2);
            opts[currentKey] = true;
        } else if (currentKey) {
            opts[currentKey] = arg;
            currentKey = null;
        } else {
            
        }
    }
    return opts;

}