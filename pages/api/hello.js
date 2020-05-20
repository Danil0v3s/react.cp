const { sqlCon } = require('../../server');

export default (req, res) => {
    res.status(200).json({ text: 'Hello', sqlCon })
}