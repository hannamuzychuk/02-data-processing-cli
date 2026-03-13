import readline from 'node:readline';
import fs from "node:fs";
import path from "node:path";

export function startRepl(currentDir) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> "
    });
    rl.prompt();

    rl.on("line", async (line) => {
        const input = line.trim();

        if (input === ".exit") {
            console.log("Thank you for using Data Processing CLI!");
            process.exit(0);
        }

        try {
            if (!input) {
                console.log('Invalid input')
            } else {
                const [command, ...args] = input.split(/\s+/);
                switch (command) {
                    case 'cd': 
                      if (args.length !== 1) {
                      console.log('Invalid input');
                    } else {
                    const newPath = path.resolve(currentDir, args[0]);
                      if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
                     currentDir = newPath;
                     } else {
                       console.log('Operation failed');
                     }
                        }
                        break;

                    case "pwd":
                        console.log(currentDir);
                        break;
                    case 'ls':
                        try {
                            const files = fs.readdirSync(currentDir);
                            console.log(files.join('  '));
                        } catch {
                            console.log('Operation failed');
                        }
                        break;
                    default:
                
                        console.log('Invalid input');
               }
            }
        
        } catch {
            console.log("Operation failed")
        }
        console.log(`You are currently in ${currentDir}`);
        rl.prompt();
    });
    process.on("SIGINT", () => {
        console.log('\nThank you for using Data Processing CLI!');
        process.exit(0);
    });
} 