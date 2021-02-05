import express from 'express';
import { QueryTypes } from 'sequelize';

import sequelize from '../config/db.config';
import { User } from '../models/models';

export const leaderboard = async (req: express.Request, res: express.Response) => {
	try {
		let leaders = await sequelize.query('SELECT name, points, ROW_NUMBER() OVER (ORDER BY points DESC) as place FROM users LIMIT 10', {
			type: QueryTypes.SELECT,
		});

		let responseObject: any = { leaders };

		if (req.userObject) {
			let user = await User.findByPk(req.userObject?.id);
			let getUserRank = await sequelize.query('SELECT COUNT(*) + 1 AS rank FROM users WHERE points > :points', {
				replacements: { points: user?.points },
				type: QueryTypes.SELECT,
			});
			responseObject.current_user_place = (getUserRank as any)[0].rank;
		}

		return res.status(200).json(responseObject);
	} catch (e) {
		console.log('[ERROR][/leaderboard] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
};
