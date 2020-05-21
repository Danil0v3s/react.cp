const { Settings, Env } = require('../../../config');
const { METHOD_NOT_ALLOWED, BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED } = require('http-status');

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(METHOD_NOT_ALLOWED);
    }

    const { username, password } = req.body;
    
}