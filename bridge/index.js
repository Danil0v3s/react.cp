const net = require('net');
const struct = require('./struct');
const { inet_aton, toArrayBuffer } = require('./util');

const client = new net.Socket();

const config = {
    host: '127.0.0.1',
    port: 5121
};

const commands = {
    0xe01: '',
    0xe02: serverConnectAck,
    0xe03: 'etc'
}

function serverConnectAck(buffer) {
    const response = struct('<Hb').unpack(buffer);
    const errCode = response[1];
    console.log(`SERVER ACK - ERROR CODE: ${errCode}`);
}

function login() {
    const header = 0xe01;
    const fmt = "<H24s24sih";
    const username = 's1';
    const password = 'p1';
    const server_ip = inet_aton('192.168.0.1');
    const port = 5121;

    const s = struct(fmt);
    const data = s.pack(header, username, password, server_ip, port);

    client.write(new Uint8Array(data));
}

exports.connect = () => {
    client.connect(config, () => {
        console.log('connected to ' + config.host + ':' + config.port);

        login();
    });

    client.on("data", (data) => {
        const buffer = toArrayBuffer(data);

        /**
         * header
         */
        const cmd = struct('<H').unpack(buffer)[0];

        commands[cmd](buffer);
    })
}
