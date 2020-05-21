const { Settings, Env } = require('../../../config');
const { METHOD_NOT_ALLOWED, BAD_REQUEST } = require('http-status');

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(METHOD_NOT_ALLOWED).send();
    }

    const { username, email } = req.body;
    const validationError = validateRequestBody(req.body);

    if (validationError) {
        return res.status(BAD_REQUEST).json({
            status: BAD_REQUEST,
            message: validationError
        })
    }

    if (checkDuplicateUsername(username)) {
        throw Exception()
    }

    if (!Settings.allowDuplicateEmail && checkDuplicateEmail(email)) {
        throw Exception()
    }

    register(req.sqlPool, req.body);
}

function checkDuplicateEmail(email) {
    const query = `SELECT email FROM ${Env.loginDatabase}.login WHERE email = ? LIMIT 1`;
}

function checkDuplicateUsername(username) {
    const query = `SELECT userid FROM ${Env.loginDatabase}.login WHERE ${Settings.usernameCaseSensitive ? 'LOWER(userid) = LOWER(?)' : 'BINARY userid = ?'} LIMIT 1`;
}

function register(sqlPool, { }) {
    const query = `INSERT INTO ${Env.loginDatabase}.login  (userid, user_pass, email, sex, group_id, birthdate) VALUES (?, ?, ?, ?, ?, ?)`;
}

function validateRequestBody({ username, password, passwordConfirm, email, emailConfirm, gender }) {
    if (new RegExp(`/[^${Settings.accountUsernameAllowedChars}]/`).test(username)) {
        return 'Invalid character(s) used in username';
    } else if (username.length < Settings.accountMinUsernameLength) {
        return 'Username is too short';
    } else if (username.length > Settings.accountMaxUsernameLength) {
        return 'Username is too long';
    } else if (!Settings.accountAllowUserInPassword && password.includes(username)) {
        return 'Password contains username';
    } else if (new RegExp('/[\x00-\x1F]/').test(password)) {
        return 'Invalid character(s) used in password';
    } else if (password.length < Settings.accountMinPasswordLength) {
        return 'Password is too short';
    } else if (password.length > Settings.accountMaxPasswordLength) {
        return 'Password is too long';
    } else if (password != passwordConfirm) {
        return 'Passwords do not match';
    } else if (Settings.accountPasswordMinUpper > 0 && password.match(/[A-Z]/).length < Settings.accountPasswordMinUpper) {
        return `Passwords must contain at least ${Settings.accountPasswordMinUpper} uppercase letter(s)`;
    } else if (Settings.accountPasswordMinLower > 0 && password.match(/[a-z]/).length < Settings.accountPasswordMinLower) {
        return `Passwords must contain at least ${Settings.accountPasswordMinLower} lowercase letter(s)`;
    } else if (Settings.accountPasswordMinNumber > 0 && password.match(/[0-9]/).length < Settings.accountPasswordMinNumber) {
        return `Passwords must contain at least ${Settings.accountPasswordMinNumber} number(s)`;
    } else if (Settings.accountPasswordMinSymbol > 0 && password.match(/[^A-Za-z0-9]/).length < Settings.accountPasswordMinSymbol) {
        return `Passwords must contain at least ${Settings.accountPasswordMinSymbol} symbol(s)`;
    } else if (!email.match(/^(.+?)@(.+?)$/)) {
        return 'Invalid e-mail address';
    } else if (email != emailConfirm) {
        return 'Emails do not match';
    } else if (!['M', 'F'].contains(gender)) {
        return 'Invalid gender';
    } else return null
}