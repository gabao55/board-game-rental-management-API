import Joi from 'joi';
import connection from '../db/db.js';

const gameSchema = Joi.object({
    name: Joi.string().required().min(1),
    image: Joi.string(),
    stockTotal: Joi.number().integer().required().min(1),
    categoryId: Joi.number().integer().required(),
    pricePerDay: Joi.number().integer().required().min(1),
});

async function listGames (req, res) {
    const { name } = req.query;

    // TODO: Must use join to get the category name
    
    if (name === undefined) {
        const allGames = await connection.query('SELECT * FROM games;');
        return res.status(200).send(allGames.rows);
    }

    const queriedGames = await connection.query('SELECT * FROM games WHERE LOWER(name) LIKE LOWER($1);', [`${name}%`]);

    res.status(200).send(queriedGames.rows);
}

async function createGame (req, res) {
    const validation = gameSchema.validate(req.body);
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    }

    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
    
    const categorieExists = await connection.query('SELECT * FROM categories WHERE id = $1;', [categoryId]);
    if (!categorieExists.rows.length) return res.status(400).send('Categorie does not exist')

    const nameExists = await connection.query('SELECT * FROM games WHERE name = $1;', [name]);
    if (nameExists.rows.length) return res.status(409).send('A game with the same name is already registered.');

    connection.query('INSERT INTO games(name, image, "stockTotal", "categoryId", "pricePerDay") VALUES($1, $2, $3, $4, $5);',
    [name, image, stockTotal, categoryId, pricePerDay]);

    res.sendStatus(201);
}

export { listGames, createGame };