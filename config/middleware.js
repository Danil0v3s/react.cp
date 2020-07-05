const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./env');
const { UNAUTHORIZED, BAD_REQUEST } = require('http-status');

const UNAUTHORIZED_ROUTES = ['/api/account/login', '/api/account/create']

exports.verifyToken = (token, callback) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, decoded);
        }
    })
}

exports.authorization = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        this.verifyToken(token, (err, decoded) => {
            if (err) {
                return res.status(UNAUTHORIZED).json({
                    status: UNAUTHORIZED,
                    message: `You're not allowed to see this`
                })
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else if (UNAUTHORIZED_ROUTES.includes(req.originalUrl)) {
        next();
    } else {
        return res.status(BAD_REQUEST).json({
            status: BAD_REQUEST,
            message: 'Invalid Auth info supplied'
        })
    }
}