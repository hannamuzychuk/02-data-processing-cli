import fs from 'node:fs/promises';
import path from 'node:path';

export async function handleNavigation(command, args, currentDir) {
   try {  
    switch (command) {
        case 'cd': {
            if (args.length !== 1) {
                console.log('Invalid input');
                return currentDir;
            }
            const newPath = path.resolve(currentDir, args[0]);
            const stat = await fs.stat(newPath);
            if (stat.isDirectory()) {
                return newPath;
            } else {
                console.log('Operation failed');
                return currentDir;
            }
        }     
        case "up": {
            const parentDir = path.dirname(currentDir);
            return (parentDir !== currentDir ? parentDir : currentDir);
        }               
        case 'ls': {
           
                const entries = await fs.readdir(currentDir, { withFileTypes: true });
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
               return currentDir; 
            }
            
        case "pwd": {
            console.log(currentDir);
            return currentDir;
    }
    }
} catch {

        console.log('Operation failed');
        return currentDir;

    }

}