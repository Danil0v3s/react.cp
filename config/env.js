require('dotenv-safe').config();

module.exports = {
    loginDatabase:                    'ragnarok',
    DB_HOST:                          process.env.DB_HOST,
    DB_USER:                          process.env.DB_USER,
    DB_PASS:                          process.env.DB_PASS,
    DB_SCHEMA:                        process.env.DB_SCHEMA,
    DB_MAX_CONNECTIONS:               process.env.DB_MAX_CONNECTIONS
}