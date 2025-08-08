import mysql from 'mysql2' 

export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'api',
    password: ''
});

export default db;
