import express from 'express';
import { configureParams, apiStatus, feedRSS } from './controller/configure';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());

app.post('/configure', configureParams);
app.get('/status', apiStatus);
app.get('/feed/rss', feedRSS);
app.listen(process.env.PORT || 3000);

console.log('Listening on port 3000....');

export default app;
