const { Settings, Env } = require('../../../config');
const { INTERNAL_SERVER_ERROR, OK, BAD_REQUEST } = require('http-status');
const { keyBy } = require('lodash');

export default async ({ body, sqlPool, decoded }, res) => {
    const { userid, accountId } = decoded;
    const { charId } = body;

    if (!charId) {
        return res.status(BAD_REQUEST).json({
            status: BAD_REQUEST,
            message: 'Mandatory info not present'
        })
    }

    try {
        const inventory = await fetchInventory(charId, sqlPool);
        const cart = await fetchCart(charId, sqlPool);

        return res.status(OK).json({
            status: OK,
            data: {
                charId,
                inventory: Object.values(inventory),
                cart: Object.values(cart)
            }
        })
    } catch (ex) {
        return res.status(INTERNAL_SERVER_ERROR).json({
            status: INTERNAL_SERVER_ERROR,
            message: ex.message
        })
    }
}

const fetchInventory = async (charId, sqlPool) => {
    const col = "inventory.*, items.name_japanese, items.type, items.slots, c.char_id, c.name AS char_name";

    let query = `SELECT ${col} FROM ragnarok.inventory `;
    query += "LEFT JOIN ragnarok.item_db_re as items ON items.id = inventory.nameid ";
    query += "LEFT JOIN ragnarok.`char` AS c ";
    query += "ON c.char_id = IF(inventory.card0 IN (254, 255), ";
    query += "IF(inventory.card2 < 0, inventory.card2 + 65536, inventory.card2) ";
    query += "| (inventory.card3 << 16), NULL) ";
    query += "WHERE inventory.char_id = ? ";
    query += "ORDER BY IF(inventory.equip > 0, 1, 0) DESC, inventory.nameid ASC, inventory.identify DESC, ";
    query += "inventory.attribute DESC, inventory.refine ASC";

    try {
        const [rows, fields] = await sqlPool.query(query, [charId]);
        const cards = await fetchCardInfo(rows, sqlPool);
        return rows.map(item => {
            return mapCards(item, cards);
        });;
    } catch (error) {
        throw error;
    }
}

const fetchCart = async (charId, sqlPool) => {
    const col = "cart_inventory.*, items.name_japanese, items.type, items.slots, c.char_id, c.name AS char_name";

    let query = `SELECT ${col} FROM ragnarok.cart_inventory `;
    query += "LEFT JOIN ragnarok.item_db_re as items ON items.id = cart_inventory.nameid ";
    query += "LEFT JOIN ragnarok.`char` AS c ";
    query += "ON c.char_id = IF(cart_inventory.card0 IN (254, 255), ";
    query += "IF(cart_inventory.card2 < 0, cart_inventory.card2 + 65536, cart_inventory.card2) ";
    query += "| (cart_inventory.card3 << 16), NULL) ";
    query += "WHERE cart_inventory.char_id = ? ";
    query += "ORDER BY cart_inventory.nameid ASC, cart_inventory.identify DESC, ";
    query += "cart_inventory.attribute DESC, cart_inventory.refine ASC";

    try {
        const [rows, fields] = await sqlPool.query(query, [charId]);
        const cards = await fetchCardInfo(rows, sqlPool);
        return rows.map(item => {
            return mapCards(item, cards);
        });
    } catch (error) {
        throw error;
    }
}

const mapCards = (item, cards) => {
    if (item.card0 > 0) {
        item.card0 = {
            name: cards[item.card0].name_japanese,
            id: cards[item.card0].id
        }
    }

    if (item.card1 > 0) {
        item.card1 = {
            name: cards[item.card1].name_japanese,
            id: cards[item.card1].id
        }
    }

    if (item.card2 > 0) {
        item.card2 = {
            name: cards[item.card2].name_japanese,
            id: cards[item.card2].id
        }
    }

    if (item.card3 > 0) {
        item.card3 = {
            name: cards[item.card3].name_japanese,
            id: cards[item.card3].id
        }
    }

    return item;
}

const fetchCardInfo = async (items, sqlPool) => {
    if (items) {
        let cardIDs = [];

        for (let item of items) {
            item.cardsOver = -item.slots;

            if (item.card0 > 0) {
                cardIDs.push(item.card0)
                item.cardsOver++;
            }
            if (item.card1 > 0) {
                cardIDs.push(item.card1);
                item.cardsOver++;
            }
            if (item.card2 > 0) {
                cardIDs.push(item.card2)
                item.cardsOver++;
            }
            if (item.card3 > 0) {
                cardIDs.push(item.card3)
                item.cardsOver++;
            }

            if (item.card0 == 254 || item.card0 == 255 || item.card0 == -256 || item.cardsOver < 0) {
                item.cardsOver = 0;
            }
        }

        if (cardIDs.length > 0) {
            let ids = Array(cardIDs.length).fill('?').join(',');
            const query = `SELECT id, name_japanese FROM ragnarok.item_db_re WHERE id IN (${ids})`;

            try {
                const [rows, fields] = await sqlPool.query(query, cardIDs);
                return keyBy(rows, 'id');
            } catch (error) {
                throw error;
            }
        }
    }
}