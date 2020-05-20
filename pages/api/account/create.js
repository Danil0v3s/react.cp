const { Settings, Env } = require('../../../config')

export default async (req, res) => {
    const {
        serverGroupName,
        username,
        password,
        passwordConfirm,
        email,
        emailConfirm,
        gender,
        birthDate,
        code
    } = req.body;

    if (new RegExp(`/[^${Settings.accountUsernameAllowedChars}]/`).test(username)) {
        throw Exception("aaa");
    } else if (username.length < Settings.accountMinUsernameLength) {

    } else if (username.length > Settings.accountMaxUsernameLength) {

    } else if (!Settings.accountAllowUserInPassword && password.includes(username)) {

    } else if (new RegExp('/[\x00-\x1F]/').test(password)) {
        // invalid characters
    } else if (password.length < Settings.accountMinPasswordLength) {

    } else if (password.length > Settings.accountMaxPasswordLength) {

    } else if (password != passwordConfirm) {

    } else if (Settings.accountPasswordMinUpper > 0 && password.match(/[A-Z]/).length < Settings.accountPasswordMinUpper) {

    } else if (Settings.accountPasswordMinLower > 0 && password.match(/[a-z]/).length < Settings.accountPasswordMinLower) {

    } else if (Settings.accountPasswordMinNumber > 0 && password.match(/[0-9]/).length < Settings.accountPasswordMinNumber) {

    } else if (Settings.accountPasswordMinSymbol > 0 && password.match(/[^A-Za-z0-9]/).length < Settings.accountPasswordMinSymbol) {

    } else if (!email.match(/^(.+?)@(.+?)$/)) {

    } else if (email != emailConfirm) {

    } else if (!['M', 'F'].contains(gender)) {
        
    }

    if (checkDuplicateUsername(username)) {
        throw Exception()
    }

    if (!Settings.allowDuplicateEmail && checkDuplicateEmail(email)) {
        throw Exception()
    }

}

function checkDuplicateEmail(email) {
    const query = `SELECT email FROM ${Env.loginDatabase}.login WHERE email = ? LIMIT 1`;
}

function checkDuplicateUsername(username) {
    const query = `SELECT userid FROM ${Env.loginDatabase}.login WHERE ${Settings.usernameCaseSensitive ? 'LOWER(userid) = LOWER(?)' : 'BINARY userid = ?'} LIMIT 1`;
}

function register() {
    const query = `INSERT INTO ${Env.loginDatabase}.login  (userid, user_pass, email, sex, group_id, birthdate) VALUES (?, ?, ?, ?, ?, ?)`;
}