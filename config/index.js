const dotenv = require('dotenv-safe');
dotenv.config();

export const Settings = {
    /** account */
    usernameCaseSensitive:          false,
    allowDuplicateEmail:            false,
    accountDefaultGroupId:          0,
    accountMinPasswordLength:       4,
    accountMaxPasswordLength:       4,
    accountMinUsernameLength:       4,
    accountMaxUsernameLength:       4,
    accountPasswordMinUpper:        1,
    accountPasswordMinLower:        1,
    accountPasswordMinNumber:       1,
    accountPasswordMinSymbol:       0,
    accountUsernameAllowedChars:    '',
    accountAllowUserInPassword:     false,

    /** system */
    useCaptcha:                     false,
    enableReCaptcha:                false
}

export const Env = {
    loginDatabase:                    'ragnarok',
    DB_HOST:                          process.env.DB_HOST,
    DB_USER:                          process.env.DB_USER,
    DB_PASS:                          process.env.DB_PASS,
    DB_SCHEMA:                        process.env.DB_SCHEMA,
}