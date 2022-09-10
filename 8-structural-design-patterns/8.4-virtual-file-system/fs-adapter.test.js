import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import level from 'level';
import { createFSAdapter } from './fs-adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new level.Level(join(__dirname, 'db'), { valueEncoding: 'binary' });


const fs = createFSAdapter(db);

fs.writeFile('lucas.txt', 'LUCAS!!!', (err) => {
    if (err) {
        console.log(err);
        return;
    }
    fs.readFile('lucas.txt', (err, value) => {
        console.log(value.toString());
    })
})