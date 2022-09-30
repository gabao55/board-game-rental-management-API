import connection from "../db/db.js";
import Joi from 'joi';

const customerSchema = Joi.object({
    name: Joi.string().required().min(1),
    phone: Joi.string().required().min(10).max(11).regex(/^\d+$/),
    cpf: Joi.string().required().length(11).regex(/^\d+$/),
    birthday: Joi.date().required(),
});

async function createCustomer (req, res) {
    const validation = customerSchema.validate(req.body);
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    }

    const { cpf } = req.body;

    try {
        const customerExists = await connection.query('SELECT * FROM customers WHERE cpf = $1;', [cpf]);
        if (customerExists.rows.length) return res.status(409).send('CPF already registered');

        const { name, phone, birthday } = req.body;

        connection.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);', [name, phone, cpf, birthday]);

        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error);
    }
}

async function listCustomers (req, res) {
    const { cpf } = req.query;

    if (cpf === undefined) {
        try {
            const customers = await connection.query('SELECT * FROM customers;');
    
            return res.status(200).send(customers.rows);
        } catch (error) {
            return res.status(500).send(error);
        }
    }

    const queriedCustomers = await connection.query('SELECT * FROM customers WHERE cpf LIKE $1;', [`${cpf}%`]);

    res.status(200).send(queriedCustomers.rows);
}

async function listCustomer (req, res) {
    const { id } = req.params;

    const customer = await connection.query('SELECT * FROM customers WHERE id = $1;', [id]);

    if (!customer.rows.length) return res.sendStatus(404);

    res.status(200).send(customer.rows[0]);
}

async function updateCustomer (req, res) {
    const validation = customerSchema.validate(req.body);
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    }

    const id = parseInt(req.params.id);

    try {

        
        const customerExists = await connection.query('SELECT * FROM customers WHERE id = $1;', [id]);
        if (!customerExists.rows.length) return res.status(404).send('Customer not found');

        const { cpf } = req.body;

        const cpfRegistered = await connection.query('SELECT * FROM customers WHERE cpf = $1;', [cpf]);        
        if (cpfRegistered.rows.length && customerExists.rows[0].cpf !== cpf) return res.status(409).send('CPF already registered');

        const { name, phone, birthday } = req.body;
        connection.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;', [name, phone, cpf, birthday, id]);

        res.sendStatus(202);

    } catch (error) {
        res.status(500).send(error);
    }

}

export { createCustomer, listCustomers, listCustomer, updateCustomer };