import connection from "../db/db.js";
import Joi from 'joi';



const categoriesSchema = Joi.object({
    name: Joi.string().required().min(1),
})

async function listCategories (req, res) {
    const categories = await connection.query('SELECT * FROM categories;');
    res.status(200).send(categories.rows);
}

async function createCategorie (req, res) {
    const validation = categoriesSchema.validate(req.body);
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    }

    const { name } = req.body;

    const categorieExists = await connection.query('SELECT * FROM categories WHERE name = $1', [name]);
    if (categorieExists.rows.length) return res.sendStatus(409);

    connection.query('INSERT INTO categories (name) VALUES ($1)', [name]);

    res.sendStatus(201);
}

export {listCategories, createCategorie};