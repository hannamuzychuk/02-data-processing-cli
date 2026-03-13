import fs from 'node:fs';
import path from 'node:path';

export async function handleNavigation(command, args, currentDir) {
    switch (command) {
        case 'cd':
            if (args.length !== 1) {
                console.log('Invalid input');
                return currentDir;
            }
            const newPath = path.resolve(currentDir, args[0]);
            if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
                return newPath;
            } else {
                console.log('Operation failed');
                return currentDir;
            }
                    
        case "up":
            const parentDir = path.dirname(currentDir);
            return (parentDir !== currentDir ? parentDir : currentDir);
                        
        case 'ls':
            try {
                const entries = fs.readdirSync(currentDir, { withFileTypes: true });
                const folders = [];
                const files = [];
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        folders.push(entry.name);
                } else {
                    files.push(entry.name);
                  }
                }
                folders.sort();
                files.sort();

                for (const folder of folders) {
                    console.log(`${folder} [folder]`);
                }
              for (const file of files) {
                    console.log(`${file} [file]`);
                }
                
            } catch {
                console.log('Operation failed');
            }
            return currentDir;
        case "pwd":
            console.log(currentDir);
            return currentDir;
    }
}