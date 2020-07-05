const net = require('net');
const jsStruct = require('./struct');
const { inet_aton, toArrayBuffer } = require('./util');

class ROBridge {

    CLIENT_STATE_DISCONNECTED = 0;
    CLIENT_STATE_CONNECTING = 1;
    CLIENT_STATE_CONNECTED = 2;

    state = undefined;
    client = undefined;
    host = '127.0.0.1';
    port = 5121;
    registeredServices = {};
    registeredCommands = {};
    struct = jsStruct;
    io = undefined;
    sqlPool = undefined;
    session = {};

    constructor(io, sqlPool, host = this.host, port = this.port) {
        this.client = new net.Socket();
        this.host = host;
        this.port = port;
        this.state = this.CLIENT_STATE_DISCONNECTED;
        this.io = io;
        this.sqlPool = sqlPool;

        this.connect();
    }

    registerService(key, service) {
        this.registeredServices[key] = service;
        this.registeredCommands = {...this.registeredCommands, ...service.getRegisteredCommands()};
    }

    connect() {
        this.state = this.CLIENT_STATE_CONNECTING; 
        this.client.connect({ host: this.host, port: this.port }, () => {
            console.log('ROBridge', 'Connected', this.host, this.port);
            this.state = this.CLIENT_STATE_CONNECTED;
        });

        this.client.on('data', data => {
            const buffer = toArrayBuffer(data);
            const cmd = this.struct('<H').unpack(buffer)[0];

            if (this.registeredCommands[cmd]) {
                this.registeredCommands[cmd](buffer);
            }
        })
    }

    write(data) {
        this.client.write(new Uint8Array(data));
    }

    getServiceByKey(key) {
        return this.registeredServices[key];
    }

    registerUser(accountId, socketId) {
        if (!this.session.hasOwnProperty(accountId)) {
            this.session[accountId] = socketId;
        }
    }

    removeUser(accountId) {
        if (this.session.hasOwnProperty(accountId)) {
            delete this.session[accountId];
        }
    }
}

module.exports = ROBridge;