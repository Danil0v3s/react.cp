const { keyBy } = require('lodash');

exports.fetchCardsInfo = async (items, sqlPool) => {
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
                const cards = keyBy(rows, 'id');

                return items.map(item => {
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
                })
            } catch (error) {
                throw error;
            }
        } else {
            return items;
        }
    }
}