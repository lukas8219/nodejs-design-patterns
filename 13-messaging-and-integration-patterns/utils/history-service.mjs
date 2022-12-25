import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database.db');

export class HistoryService {

    constructor(){
        db.exec(`
        CREATE TABLE IF NOT EXISTS "histories" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room TEXT,
            message TEXT
        )
        `)
    }

    listHistoryMessages(room) {
        return new Promise((res, rej) => {
            db.all(`SELECT * FROM "histories" WHERE "room" = ?`, [room], (err, rows) => {
                if(err){
                    return rej(err);
                }
                return res(rows.map(({ message }) => ({ message })));
            });
        })
    }

    _runAsyncOperation(query, params){
        return new Promise((res) => db.run(query, params, res));
    }

    async saveHistory(room, data){
        return new Promise(async (res) => {
            for(const message of data){
                await this._runAsyncOperation(`INSERT INTO "histories"(room, message) VALUES(?,?);`, [ room, message ]);
            }
            return res();
        })
    }

}