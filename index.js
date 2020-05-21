const express = require('express');
const mysql = require('mysql');
const next = require('next');
const { Env } = require('./config');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

const sqlCon = mysql.createConnection({
    host: Env.DB_HOST,
    user: Env.DB_USER,
    password: Env.DB_PASS,
    database: Env.DB_SCHEMA
});

sqlCon.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL!");
    server.listen(process.env.PORT || 3000, () => {
        app.prepare().then(() => {
            server.all('*', (req, res) => {
                req.sqlConnection = sqlCon;
                handle(req, res);
            });
        }).catch((ex) => {
            console.error(ex.stack);
            process.exit(1);
        })
        console.log(`Started on port ${process.env.PORT || 3000}`)
    })
});

module.exports = {
    sqlCon
}