const { Settings, Env } = require('../../../config');
const jwt = require('jsonwebtoken');
const { METHOD_NOT_ALLOWED, BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED } = require('http-status');

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(METHOD_NOT_ALLOWED).json({
            status: METHOD_NOT_ALLOWED,
            message: 'Method not allowed'
        })
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

    const query = `SELECT userid, account_id FROM ${Env.loginDatabase}.login WHERE sex != 'S' AND group_id >= 0 ` +
        ` ${Settings.usernameCaseSensitive ? 'AND CAST(userid AS BINARY) = ? ' : 'AND LOWER(userid) = LOWER(?) '}` +
        `AND user_pass = ? LIMIT 1`;

    try {
        const [rows, fields] = await req.sqlPool.query(query, [username, password]);
        const { userid, account_id } = rows[0];

        if (userid) {
            const userToken = jwt.sign({ userid, accountId: account_id }, Env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(CREATED).json({
                userid,
                token: userToken
            });
        } else {
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: INTERNAL_SERVER_ERROR,
                message: 'Failed to retrieve login information'
            })
        }
    } catch (ex) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: INTERNAL_SERVER_ERROR,
            message: ex.message
        })
    }
}