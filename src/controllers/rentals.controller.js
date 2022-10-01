import Joi from 'joi';
import connection from '../db/db.js';

const rentalSchema = Joi.object({
    customerId: Joi.number().integer().required().min(1),
    gameId: Joi.number().integer().required().min(1),
    daysRented: Joi.number().integer().required().min(1),
});

async function createRental (req, res) {
    const validation = rentalSchema.validate(req.body);
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    }

    try {
        const { customerId, gameId, daysRented } = req.body;
        const game = await connection.query('SELECT * FROM games WHERE games.id = $1;', [gameId]);
        if (!game.rows.length) return res.status(400).send('Game not found');

        const customer = await connection.query('SELECT * FROM customers WHERE customers.id = $1;', [customerId]);
        if (!customer.rows.length) return res.status(400).send('Customer not found');

        const gameRentals = await connection.query('SELECT * FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL;', [gameId]);
        if (game.rows[0].stockTotal - gameRentals.rows.length <= 0) return res.status(400).send('No games left on stock');

        const today = new Date();
        const rentDate = `${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`;
        const returnDate = null;
        const originalPrice = game.rows[0].pricePerDay*daysRented;
        const delayFee = null;

        const rentalInsertionArray = [
            customerId,
            gameId,
            rentDate,
            daysRented,
            returnDate,
            originalPrice,
            delayFee,
        ]

        connection.query('INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);', rentalInsertionArray);

        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(error);
    }
}

async function listRentals (req, res) {
    const { customerId, gameId } = req.query;

    const standardQuery = 'SELECT rentals.*, customers.name as "customerName", games.name as "gameName", games."categoryId" as "categoryId", categories.name as "categoryName" FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id';
    let allRentals;
    if (customerId === undefined && gameId === undefined) {
        allRentals = await connection.query(standardQuery + ';');
    } else if (gameId === undefined) {
        allRentals = await connection.query(standardQuery + ' WHERE rentals."customerId" = $1;', [parseInt(customerId)]);
    } else if (customerId === undefined) {
        allRentals = await connection.query(standardQuery + ' WHERE rentals."gameId" = $1;', [parseInt(gameId)]);
    } else {
        allRentals = await connection.query(standardQuery + ' WHERE rentals."gameId" = $1 AND rentals."customerId" = $2;', [parseInt(gameId), parseInt(customerId)]);
    }
    
    const allRentasFormattedArray = allRentals.rows.map(rental => {
        return {
            id: rental.id,
            customerId: rental.customerId,
            gameId: rental.gameId,
            rentDate: `${rental.rentDate.getFullYear()}/${rental.rentDate.getMonth()+1}/${rental.rentDate.getDate()}`,
            daysRented: rental.daysRented,
            returnDate: rental.returnDate,
            originalPrice: rental.originalPrice,
            delayFee: rental.delayFee,
            customer: {
                id: rental.customerId,
                name: rental.customerName,
            },
            game: {
                id: rental.gameId,
                name: rental.gameName,
                categoryId: rental.categoryId,
                categoryName: rental.categoryName,
            },
        }
    })

    res.status(200).send(allRentasFormattedArray);
}

async function deleteRental (req, res) {
    const id = parseInt(req.params.id);

    const rental = await connection.query('SELECT * FROM rentals WHERE id = $1;', [id]);

    if (!rental.rowCount) return res.status(404).send('Rental id not found');

    if (rental.rows[0].returnDate) return res.status(400).send('You cannot delete a rental that has already been finished');

    connection.query('DELETE FROM rentals WHERE id = $1;', [id])

    res.sendStatus(200);
}

async function finishRental (req, res) {

}

export { createRental, listRentals, deleteRental, finishRental };