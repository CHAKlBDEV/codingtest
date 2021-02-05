require('dotenv').config();
import express from 'express';
import { body } from 'express-validator';
import morgan from 'morgan';

import auth from './middlewares/auth';
import * as nowController from './controllers/now';
import * as userController from './controllers/user';
import * as gameController from './controllers/game';
import * as leaderboardController from './controllers/leaderboard';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/now', nowController.now);
app.post('/register', body('name').exists().isString().isLength({ min: 3 }), userController.register);
app.get('/me', auth(), userController.me);
app.post('/game/play', auth(), gameController.play);
app.post('/game/claim_bonus', auth(), gameController.claimBonus);
app.get('/leaderboard', auth(false), leaderboardController.leaderboard);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`App listening at http://localhost:${PORT}`);
});
