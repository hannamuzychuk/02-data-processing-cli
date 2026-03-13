import readline from 'node:readline';
import { handleNavigation } from './navigation.js';
import {handleCount} from './commands/count.js'
export function startRepl(currentDir) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const input = line.trim();

        if (input === '.exit') {
            console.log('Thank you for using Data Processing CLI!');
            process.exit(0);
        }

        if (!input) {
            console.log('Invalid input');
            rl.prompt();
            return
        }

      const [command, ...args] = input.split(/\s+/);
        
        try {
            if (['cd', 'up', 'ls', 'pwd'].includes(command)) {
                currentDir = await handleNavigation(command, args, currentDir);

            } else if (command ==='count') {
                await handleCount(args, currentDir);

            } else {
                console.log('Invalid input');
            }

        } catch (error) {
            console.log('Operation failed')
    }
    
        console.log(`You are currently in ${currentDir}`);
        rl.prompt();
});
    
    process.on('SIGINT', () => {
        console.log('\nThank you for using Data Processing CLI!');
        process.exit(0);
    });
} 