const { INTERNAL_SERVER_ERROR, OK, BAD_REQUEST, METHOD_NOT_ALLOWED } = require('http-status');

export default async ({ body, sqlPool, decoded, roBridge, method }, res) => {
    if (method !== 'POST') {
        return res.status(METHOD_NOT_ALLOWED).json({
            status: METHOD_NOT_ALLOWED,
            message: 'Method not allowed'
        });
    }

    const { auctionId } = body;
    const auctionService = roBridge.getServiceByKey('auction');

    if (!auctionId) {
        return res.status(BAD_REQUEST).json({
            status: BAD_REQUEST,
            message: 'Missing parameter'
        });
    } else if (!auctionService) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: INTERNAL_SERVER_ERROR,
            message: 'Something went wrong'
        });
    }

    try {
        auctionService.sendAuctionBuyRequest(auctionId, decoded.accountId);
        return res.status(OK).json({
            status: OK,
            message: 'Request sent'
        })
    } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
}