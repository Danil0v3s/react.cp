const { Settings, Env } = require('../../../config');
const { INTERNAL_SERVER_ERROR, OK } = require('http-status');

export default async ({ body, sqlPool, decoded }, res) => {
    const { userid, accountId } = decoded;

    try {
        const chars = await fetchCharacters(accountId, sqlPool);

        return res.status(OK).json({
            status: OK,
            data: Object.values(chars)
        })
    } catch (ex) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: INTERNAL_SERVER_ERROR,
            message: ex.message
        })
    }
}

const fetchCharacters = async (accountId, sqlPool) => {
    const query = "SELECT ch.*, guild.name AS guild_name, guild.emblem_len AS guild_emblem_len FROM ragnarok.`char` AS ch" +
        " LEFT OUTER JOIN ragnarok.guild ON guild.guild_id = ch.guild_id WHERE ch.account_id = ? ORDER BY ch.char_num ASC";

    try {
        const [rows, fields] = await sqlPool.query(query, [accountId]);
        return rows;
    } catch (error) {
        throw error;
    }
}