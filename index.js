const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bluebird = require('bluebird');
const next = require('next');
const { Env } = require('./config');
const middleware = require('./config/middleware');

const ROBridge = require('./bridge/ROBridge');
const LoginService = require('./bridge/LoginService');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
server.use(cors())

const sqlPool = mysql.createPool({
    connectionLimit: Env.DB_MAX_CONNECTIONS,
    host: Env.DB_HOST,
    user: Env.DB_USER,
    password: Env.DB_PASS,
    database: Env.DB_SCHEMA,
    Promise: bluebird
});

const prepareRequest = (req, res, roBridge) => {
    req.sqlPool = sqlPool.promise();
    req.roBridge = roBridge;
    handle(req, res);
}

const setupRoutes = (roBridge) => {
    server.get('*', middleware, (req, res) => {
        prepareRequest(req, res, roBridge);
    });
    server.post('/api/account/login', (req, res) => {
        prepareRequest(req, res, roBridge);
    });
    server.post('/api/account/create', (req, res) => {
        prepareRequest(req, res, roBridge);
    });
}

server.listen(process.env.PORT || 3000, () => {
    app.prepare().then(() => {

        const roBridge = new ROBridge();
        roBridge.registerService('login', new LoginService(roBridge, 's1', 'p1', '127.0.0.1', 5121));

        setupRoutes(roBridge);

        roBridge.getServiceByKey('login').login();
        
    }).catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    })
    console.log(`Started on port ${process.env.PORT || 3000}`)
});
