import mysql from 'mysql2' 

export const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'api',
    password: '',
    waitForConnections: true,
    connectionLimit: 0,
    queueLimit: 0
});

export default db;
