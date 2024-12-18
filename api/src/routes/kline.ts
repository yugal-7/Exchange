// import { Client } from 'pg';
import { Router } from "express";
import { RedisManager } from "../RedisManager";

// const pgClient = new Client({
//     user: process.env.DATABASE_USER,
//     host: process.env.DATABASE_HOST,
//     database: process.env.DATABASE_NAME,
//     password: process.env.DATABASE_PASSWORD,
//     port: 5432,
// });
// pgClient.connect();

export const klineRouter = Router();

klineRouter.get("/", async (req, res) => {
    const { market, interval, startTime, endTime, symbol } = req.query;

    // let query;
    // switch (interval) {
    //     case '1m':
    //         query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
    //         break;
    //     case '1h':
    //         query = `SELECT * FROM klines_1m WHERE  bucket >= $1 AND bucket <= $2`;
    //         break;
    //     case '1w':
    //         query = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
    //         break;
    //     default:
    //         return res.status(400).send('Invalid interval');
    // }

    try {
        //@ts-ignore
        // const result = await pgClient.query(query, [new Date(startTime * 1000 as string), new Date(endTime * 1000 as string)]);
        //  res.json(result.rows.map(x => ({
        //     close: x.close,
        //     end: x.bucket,
        //     high: x.high,
        //     low: x.low,
        //     open: x.open,
        //     quoteVolume: x.quoteVolume,
        //     start: x.start,
        //     trades: x.trades,
        //     volume: x.volume,
        // })));
        const response = await fetch(`https://api.backpack.exchange/api/v1/klines?symbol=${symbol}&interval=1h&startTime=${startTime}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});