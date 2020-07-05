const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bluebird = require('bluebird');
const next = require('next');

const { Env, Redis: redisConfig } = require('./config');
const { verifyToken, authorization } = require('./config/middleware');
const ROBridge = require('./bridge/ROBridge');
const LoginService = require('./bridge/LoginService');
const AuctionService = require('./bridge/AuctionService');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
server.use(cors());
const io = require('socket.io')(process.env.SOCKET_IO_PORT || 3030);

io.use((client, next) => {
    let token = client.handshake.query.token;
    verifyToken(token, (err, decoded) => {
        if (err) {
            return next(new Error('authentication error'));
        }

        client.handshake.decoded = decoded;
        next();
    });
})

const sqlPool = mysql.createPool({
    connectionLimit: Env.DB_MAX_CONNECTIONS,
    host: Env.DB_HOST,
    user: Env.DB_USER,
    password: Env.DB_PASS,
    database: Env.DB_SCHEMA,
    Promise: bluebird
});

server.listen(process.env.PORT || 3000, () => {
    app.prepare().then(() => {

        const roBridge = new ROBridge(io, sqlPool.promise());
        roBridge.registerService('login', new LoginService(roBridge, 's1', 'p1', '127.0.0.1', 5121));
        roBridge.registerService('auction', new AuctionService(roBridge));

        server.all('*', authorization, (req, res) => {
            req.sqlPool = sqlPool.promise();
            req.roBridge = roBridge;
            handle(req, res);
        });

        roBridge.getServiceByKey('login').login();

        io.on('connection', async (client) => {
            client.on('subscribeToAuction', () => {
                roBridge.registerUser(client.handshake.decoded.accountId, client.id);
            })
            client.on('disconnect', () => {
                roBridge.removeUser(client.handshake.decoded.accountId)
            })
        })

    }).catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    })
    console.log(`Started on port ${process.env.PORT || 3000}`)
});
