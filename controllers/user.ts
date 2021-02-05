import express from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/models';

export const register = async (req: express.Request, res: express.Response) => {
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
};

export const me = async (req: express.Request, res: express.Response) => {
	try {
		const user = await User.findOne({ where: { id: req.userObject.id }, attributes: ['name', 'points'] });
		return res.status(200).json({ name: user?.name, points: user?.points });
	} catch (e) {
		console.log('[ERROR][/me] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
};
