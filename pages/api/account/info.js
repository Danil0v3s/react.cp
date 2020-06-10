const { Settings, Env } = require('../../../config');
const { INTERNAL_SERVER_ERROR, OK } = require('http-status');

export default async ({ body, sqlPool, decoded }, res) => {
    const { userid, accountId } = decoded;

    try {
        const account = await fetchAccountInfo(userid, sqlPool);

        return res.status(OK).json({
            status: OK,
            data: {
                ...account
            }
        })
    } catch (ex) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: INTERNAL_SERVER_ERROR,
            message: ex.message
        })
    }
}

const fetchAccountInfo = async (userid, sqlPool) => {
    const creditColumns = 'credits.balance, credits.last_donation_date, credits.last_donation_amount';
    // const query = `SELECT login.*, ${creditColumns} FROM ${Env.loginDatabase}.login ` +
    //     `LEFT OUTER JOIN ${Env.loginDatabase}.${Env.creditsTable} AS credits ON login.account_id = credits.account_id ` +
    //     `WHERE login.sex != 'S' AND login.userid = ? LIMIT 1`;
    const query = `SELECT login.* FROM ${Env.loginDatabase}.login WHERE login.sex != 'S' AND login.userid = ? LIMIT 1`;

    try {
        const [rows, fields] = await sqlPool.query(query, [userid]);
        const account = rows[0];
        delete account.user_pass;
        return account;
    } catch (error) {
        throw error;
    }
}