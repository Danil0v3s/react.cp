const { fetchSingleListing } = require('../pages/api/auction/list')

class AuctionService {

    bridge = undefined;
    registeredCommands = {};

    constructor(bridge) {
        this.bridge = bridge;

        this.registeredCommands[0xe03] = this.parseAuctionBuyResponse;
        this.registeredCommands[0xe04] = this.parseAuctionRegisterResponse;
    }

    getRegisteredCommands() {
        return this.registeredCommands;
    }

    parseAuctionBuyResponse = buffer => {
        const response = this.bridge.struct('<Hbib').unpack(buffer);
        const action = response[0]
        const exitCode = response[1];
        const accountId = response[2];
        const auctionId = response[3];

        const session = this.bridge.session[accountId];
        if (exitCode == 0) {
            this.bridge.io.emit('auctionResponse', { action, data: { auctionId }, exitCode });
        } else if (session) {
            this.bridge.io.to(session).emit('auctionResponse', { action, exitCode });
        }
    }

    parseAuctionRegisterResponse = async buffer => {
        const response = this.bridge.struct('<Hb').unpack(buffer);
        const action = response[0]
        const auctionId = response[1];

        const auction = await fetchSingleListing(this.bridge.sqlPool, auctionId);
        if (auction) {
            this.bridge.io.emit('auctionResponse', { action, data: auction });
        }
    }

    sendAuctionBuyRequest = (auctionId, accountId) => {
        const fmt = '<HHii'
        const header = 0xe03;
        const stc = this.bridge.struct(fmt)
        const data = stc.pack(header, stc.size, Number(auctionId), accountId);
        this.bridge.write(data);
    }

}

module.exports = AuctionService;