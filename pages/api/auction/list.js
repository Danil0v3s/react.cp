const { Settings, Env } = require('../../../config');
const { INTERNAL_SERVER_ERROR, OK, BAD_REQUEST } = require('http-status');
const { fetchCardsInfo } = require('../util');

export default async ({ body, sqlPool, decoded }, res) => {
    const { userid, accountId } = decoded;

    try {
        const listings = await fetchListings(sqlPool);

        return res.status(OK).json({
            status: OK,
            data: Object.values(listings)
        })
    } catch (ex) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: INTERNAL_SERVER_ERROR,
            message: ex.message
        })
    }
}

const fetchListings = async (sqlPool) => {
    let query = "SELECT a.*, COALESCE(items.slots, 0) as slots FROM auction a LEFT JOIN item_db_re items ON items.id = a.nameid";

    try {
        const [rows, fields] = await sqlPool.query(query);
        const itemsWithCardsInfo = await fetchCardsInfo(rows, sqlPool);
        return itemsWithCardsInfo;
    } catch (error) {
        throw error;
    }
}