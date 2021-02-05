require('dotenv').config();
import express from 'express';
import { body, validationResult } from 'express-validator';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { Op, QueryTypes } from 'sequelize';
import dayjs from 'dayjs';

import sequelize from './config/db.config';
import { User } from './models/models';
import auth from './middlewares/auth';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/now', (req, res) => {
	return res.status(200).json({ timestamp: Date.now() });
});

app.post('/register', body('name').exists().isString().isLength({ min: 3 }), async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ message: 'name_invalid_or_missing' });
	}
	const { name } = req.body;
	try {
		const usersWithSameName = (await User.count({ where: { name } })) != 0;
		if (usersWithSameName) {
			return res.status(409).json({ message: 'name_already_taken' });
		}

		let user = await User.create({ name });

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || '', { expiresIn: '1d' });

		return res.status(200).json({ message: 'user_registred_successfully', token });
	} catch (e) {
		console.log('[ERROR][/register] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
});

app.get('/me', auth(), async (req, res) => {
	try {
		const user = await User.findOne({ where: { id: req.userObject.id }, attributes: ['name', 'points'] });
		return res.status(200).json({ name: user?.name, points: user?.points });
	} catch (e) {
		console.log('[ERROR][/me] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
});

app.post('/game/play', auth(), async (req, res) => {
	try {
		let user = await User.findByPk(req.userObject?.id);

		const lastGameHourSig = dayjs(user?.lastGame || 0).format('YYYY-MM-DD-HH');
		const currentHourSig = dayjs().format('YYYY-MM-DD-HH');

		if (lastGameHourSig === currentHourSig) {
			if (user?.gamesPlayedLastHour && user?.gamesPlayedLastHour >= 5) {
				return res.status(401).json({ message: 'limit_exceeded' });
			} else {
				await User.increment('gamesPlayedLastHour', { by: 1, where: { id: req.userObject.id } });
			}
		} else {
			await User.update({ gamesPlayedLastHour: 1 }, { where: { id: req.userObject.id } });
		}

		const pointsToAdd = Math.floor(Math.random() * 100);

		await User.increment('points', { by: pointsToAdd, where: { id: req.userObject.id } });
		await User.update({ lastGame: Date.now() }, { where: { id: req.userObject.id } });

		return res.status(200).json({ points_added: pointsToAdd, points_total: user?.points as number + pointsToAdd });
	} catch (e) {
		console.log('[ERROR][/game/play] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
});

app.post('/game/claim_bonus', auth(), async (req, res) => {
	try {
		const lastClaim = (await User.findByPk(req.userObject.id))?.lastClaim;
		const pointsAllowed = dayjs(lastClaim).diff(dayjs(), 'minutes', false) * -10;
		const pointsToAdd = Math.min(100, pointsAllowed);

		if (pointsToAdd > 0) {
			await User.increment('points', { by: pointsToAdd, where: { id: req.userObject.id } });
			await User.update({ lastClaim: Date.now() }, { where: { id: req.userObject.id } });
		}

		const user = await User.findByPk(req.userObject.id);

		return res.status(200).json({ points_added: pointsToAdd, points_total: user?.points });
	} catch (e) {
		console.log('[ERROR][/game/claim_bonus] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
});

app.get('/leaderboard', auth(false), async (req, res) => {
	try {
		let leaders = await sequelize.query('SELECT name, points, ROW_NUMBER() OVER (ORDER BY points DESC) as place FROM users LIMIT 10', {
			type: QueryTypes.SELECT,
		});

		let responseObject: any = { leaders };

		if (req.userObject) {
			let user = await User.findByPk(req.userObject?.id);
			let getUserRank = await sequelize.query('SELECT COUNT(*) + 1 AS rank FROM users WHERE points > :points', {
				replacements: { points: user?.points },
				type: QueryTypes.SELECT
			});
			responseObject.current_user_place = (getUserRank as any)[0].rank;
		}

		return res.status(200).json(responseObject);
	} catch (e) {
		console.log('[ERROR][/leaderboard] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`App listening at http://localhost:${PORT}`);
});
