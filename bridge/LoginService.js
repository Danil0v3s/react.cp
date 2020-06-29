const { inet_aton } = require('./util');

class LoginService {

    username = '';
    password = '';
    serverIp = 0;
    port = 0;
    bridge = undefined;
    registeredCommands = {};

    constructor(bridge, username, password, serverIp, port) {

        this.bridge = bridge;
        this.username = username;
        this.password = password;
        this.serverIp = inet_aton(serverIp);
        this.port = port;

        this.registeredCommands[0xe02] = this.parseLoginResponse;
    }

    login() {
        const header = 0xe01;
        const fmt = "<H24s24sih";

        const data = this.bridge.struct(fmt).pack(header, this.username, this.password, this.serverIp, this.port);
        this.bridge.write(data);
    }

    parseLoginResponse = (buffer) => {
        const response = this.bridge.struct('<Hb').unpack(buffer);
        const errCode = response[1];
        console.log('SERVER ACK','ERROR CODE', errCode);
    }

    setUsername(username) {
        this.username = username;
    }

    setPassword(password) {
        this.password = password;
    }

    setServerIp(serverIp) {
        this.serverIp = inet_aton(serverIp);
    }

    setPort(port) {
        this.port = port;
    }

    getRegisteredCommands() {
        return this.registeredCommands;
    }
}

module.exports = LoginService;