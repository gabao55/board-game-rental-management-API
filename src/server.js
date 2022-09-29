import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connection from './db/db.js';
import categoriesRouter from './routers/categories.router.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(categoriesRouter);


app.get('/status', async (req, res) => {
    const test = await connection.query('SELECT * FROM games;');
    console.log(test.rows);
    res.sendStatus(200);
});

app.listen(process.env.PORT, console.log(`Listening to PORT ${process.env.PORT}`));