const { Settings, Env } = require('../../../config');
const { METHOD_NOT_ALLOWED, BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED } = require('http-status');

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(METHOD_NOT_ALLOWED);
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(BAD_REQUEST).json({
            status: BAD_REQUEST,
            message: 'Invalid login'
        })
    } else if (username.trim().length == 0 || password.trim().length == 0) {
        return res.status(BAD_REQUEST).json({
            status: BAD_REQUEST,
            message: 'Invalid login'
        })
    }

    const query = `SELECT userid FROM ${Env.loginDatabase}.login WHERE sex != 'S' AND group_id >= 0 ` +
        ` ${Settings.usernameCaseSensitive ? 'AND CAST(userid AS BINARY) = ? ' : 'AND LOWER(userid) = LOWER(?) '}` +
        `AND user_pass = ? LIMIT 1`;

    try {
        const [rows, fields] = await req.sqlPool.query(query, [username, password]);
        return res.status(CREATED);
    } catch (ex) {
        throw ex;
    }

    // const creditColumns = 'credits.balance, credits.last_donation_date, credits.last_donation_amount';
    // const sql = `SELECT login.*, ${creditColumns} FROM ${Env.loginDatabase}.login ` +
    //             `LEFT OUTER JOIN ${Env.loginDatabase}.${Env.creditsTable} AS credits ON login.account_id = credits.account_id ` +
    //             `WHERE login.sex != 'S' AND login.userid = ? LIMIT 1`;
}