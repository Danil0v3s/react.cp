const { Settings, Env } = require('../../../config');
const { INTERNAL_SERVER_ERROR, OK } = require('http-status');

export default async ({ body, sqlPool, decoded }, res) => {
    const { userid, accountId } = decoded;

    try {
        const account = await fetchAccountInfo(userid, sqlPool);
        const chars = await fetchCharacters(accountId, sqlPool);
        const storage = await fetchStorage(accountId, sqlPool);

        return res.status(OK).json({
            status: OK,
            data: {
                account,
                chars,
                storage
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

const fetchStorage = async (accountId, sqlPool) => {
    const col = "storage.*, items.name_japanese, items.type, items.slots, c.char_id, c.name AS char_name";

    let query = `SELECT ${col} FROM ragnarok.storage `;
    query += "LEFT JOIN ragnarok.item_db_re as items ON items.id = storage.nameid ";
    query += "LEFT JOIN ragnarok.`char` AS c ";
    query += "ON c.char_id = IF(storage.card0 IN (254, 255), ";
    query += "IF(storage.card2 < 0, storage.card2 + 65536, storage.card2) ";
    query += "| (storage.card3 << 16), NULL) ";
    query += "WHERE storage.account_id = ? ";
    query += "ORDER BY storage.nameid ASC, storage.identify DESC, ";
    query += "storage.attribute DESC, storage.refine ASC";

    // $cards = array();

	// if ($items) {
	// 	$cardIDs = array();

	// 	foreach ($items as $item) {
	// 		$item->cardsOver = -$item->slots;
			
	// 		if ($item->card0) {
	// 			$cardIDs[] = $item->card0;
	// 			$item->cardsOver++;
	// 		}
	// 		if ($item->card1) {
	// 			$cardIDs[] = $item->card1;
	// 			$item->cardsOver++;
	// 		}
	// 		if ($item->card2) {
	// 			$cardIDs[] = $item->card2;
	// 			$item->cardsOver++;
	// 		}
	// 		if ($item->card3) {
	// 			$cardIDs[] = $item->card3;
	// 			$item->cardsOver++;
	// 		}
			
	// 		if ($item->card0 == 254 || $item->card0 == 255 || $item->card0 == -256 || $item->cardsOver < 0) {
	// 			$item->cardsOver = 0;
	// 		}
	// 	}

	// 	if ($cardIDs) {
	// 		$ids = implode(',', array_fill(0, count($cardIDs), '?'));
	// 		$sql = "SELECT id, name_japanese FROM {$server->charMapDatabase}.items WHERE id IN ($ids)";
	// 		$sth = $server->connection->getStatement($sql);

	// 		$sth->execute($cardIDs);
	// 		$temp = $sth->fetchAll();
	// 		if ($temp) {
	// 			foreach ($temp as $card) {
	// 				$cards[$card->id] = $card->name_japanese;
	// 			}
	// 		}
	// 	}
	// }
    
    try {
        const [rows, fields] = await sqlPool.query(query, [accountId]);
        return rows;
    } catch (error) {
        throw error;
    }
}