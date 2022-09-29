import express from 'express';
import { createGame, listGames } from '../controllers/games.controller.js';

const router = express.Router();

router.post('/games', createGame);
router.get('/games', listGames);

export default router;