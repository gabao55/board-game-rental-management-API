import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoriesRouter from './routers/categories.router.js';
import gamesRouter from './routers/games.router.js'
import customersRouter from './routers/customers.router.js'
import rentalsRouter from './routers/rentals.router.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(categoriesRouter);
app.use(gamesRouter);
app.use(customersRouter);
app.use(rentalsRouter);

app.get('/status', async (req, res) => {
    res.sendStatus(200);
});

app.listen(process.env.PORT, console.log(`Listening to PORT ${process.env.PORT}`));