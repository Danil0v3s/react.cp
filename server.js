const next = require('next');
const express = require('express');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.all('*', (req, res) => handle(req, res))

    server.listen(process.env.PORT || 3000, () => console.log(`Started on port ${process.env.PORT || 3000}`))
}).catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
})