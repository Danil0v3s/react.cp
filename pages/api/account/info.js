const { Settings, Env } = require('../../../config');
const { INTERNAL_SERVER_ERROR, OK } = require('http-status');

export default async ({ body, sqlPool }, res) => {
    const { userid } = body;

    try {
        const account = await fetchAccountInfo(userid, sqlPool);
        const chars = await fetchCharacters(userid, sqlPool);

        return res.status(OK).json({
            status: OK,
            data: {
                account,
                chars
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
    const query = `SELECT login.*, ${creditColumns} FROM ${Env.loginDatabase}.login ` +
        `LEFT OUTER JOIN ${Env.loginDatabase}.${Env.creditsTable} AS credits ON login.account_id = credits.account_id ` +
        `WHERE login.sex != 'S' AND login.userid = ? LIMIT 1`;

    try {
        const [rows, fields] = await sqlPool.query(query, [userid]);
        return rows;
    } catch (error) {
        throw error;
    }
}

const fetchCharacters = async (userid, sqlPool) => {
    const query = "SELECT ch.*, guild.name AS guild_name, guild.emblem_len AS guild_emblem_len FROM {$athena->charMapDatabase}.`char`" +
        " AS ch LEFT OUTER JOIN {$athena->charMapDatabase}.guild ON guild.guild_id = ch.guild_id WHERE ch.account_id = ? ORDER BY ch.char_num ASC";

    try {
        const [rows, fields] = await sqlPool.query(query, [userid]);
        return rows;
    } catch (error) {
        throw error;
    }
}