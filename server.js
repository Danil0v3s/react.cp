const next = require('next');
const express = require('express');
const mysql = require('mysql');
const { Env } = require('./config');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

export const sqlCon = mysql.createConnection({
    host: Env.DB_HOST,
    user: Env.DB_USER,
    password: Env.DB_PASS,
    database: Env.DB_SCHEMA
});

sqlCon.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL!");

    app.prepare().then(() => {
        const server = express();

        server.all('*', (req, res) => handle(req, res));

        server.listen(process.env.PORT || 3000, () => console.log(`Started on port ${process.env.PORT || 3000}`))
    }).catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    })
});