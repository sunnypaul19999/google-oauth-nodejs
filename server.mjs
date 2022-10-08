import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { oauthRouter } from './routes/oauth.mjs';

const server = express();

function corsInit() {
    //configuring cors
    cors({
        origin: 'http://localhost:3000, http://localhost:7000',
        methods: ['GET', 'POST'],
        credentials: true,
        maxAge: 3 * 60 * 1000
    });

    return cors;
}

function serverInit() {
    dotenv.config();
    //placing middlewares
    // server.set('query parser', queryParser);
    server.use('/api/v1', oauthRouter);
    server.listen(7000);
    console.log('listening on port 7000');
}

export { serverInit };