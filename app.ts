require('dotenv').config();
import express from 'express';
import { body, validationResult } from 'express-validator';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import dayjs from 'dayjs';

import { User, Game } from './models/models';
import auth from './middlewares/auth';
import Leader from './types/leader';
import LeaderboardResponseObject from './types/leaderResponse';

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
	const startDate = dayjs().set('milliseconds', 0).set('seconds', 0).set('minutes', 0).toDate();
	const endDate = dayjs(startDate).add(1, 'hour').toDate();
	try {
		const gamesLastHour = await Game.count({ where: { user: req.userObject.id, date: { [Op.between]: [startDate, endDate] } } });
		if (gamesLastHour >= 5) {
			return res.status(401).json({ message: 'limit_exceeded' });
		}

		const pointsToAdd = Math.floor(Math.random() * 100);

		await User.increment('points', { by: pointsToAdd, where: { id: req.userObject.id } });
		await Game.create({ user: req.userObject.id });

		const user = await User.findByPk(req.userObject.id);

		return res.status(200).json({ points_added: pointsToAdd, points_total: user?.points });
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
		let leaders = await User.findAll({ order: [['points', 'DESC']] });

		let responseObject = new LeaderboardResponseObject();

		if (req.userObject) {
			responseObject.current_user_place = leaders.findIndex((value) => value.id == req.userObject.id) + 1;
		}

		leaders.forEach((user, index) => {
			responseObject.leaders.push(new Leader(user.name, index + 1, user.points));
		});

		if (responseObject.leaders.length > 10) responseObject.leaders.length = 10;

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
