import dayjs from 'dayjs';

import { User } from '../models/models';
import sequelize from '../config/db.config';
import UserInterface from '../types/user.interface';

export default class GameService {
	static async play(user: UserInterface) {
		try {
			const lastGameHourSig = dayjs(user.lastGame || 0).format('YYYY-MM-DD-HH');
			const currentHourSig = dayjs().format('YYYY-MM-DD-HH');

			if (lastGameHourSig === currentHourSig) {
				if (user.gamesPlayedLastHour && user.gamesPlayedLastHour >= 5) {
					throw 'limit_exceeded';
				} else {
					user.gamesPlayedLastHour++;
				}
			} else {
				user.gamesPlayedLastHour = 1;
			}

			const pointsToAdd = Math.floor(Math.random() * 100);

			user.points += pointsToAdd;
			user.lastGame = new Date();

			await User.update({ gamesPlayedLastHour: user.gamesPlayedLastHour, points: user.points, lastGame: user.lastGame }, { where: { id: user.id } });

			return { points_added: pointsToAdd, points_total: user.points };
		} catch (e) {
			console.log('[ERROR][GameService][play] ', e);
			throw e;
		}
	}

	static async claimBonus(user: UserInterface) {
		try {
			const pointsAllowed = Math.abs(dayjs().diff(dayjs(user.lastClaim), 'minutes', false)) * 10;
			const pointsToAdd = Math.min(100, pointsAllowed);

			if (pointsToAdd > 0) {
				await sequelize.query('UPDATE users SET points = points + :pointsToAdd, lastClaim = :now WHERE id = :id', {
					replacements: {
						pointsToAdd: pointsToAdd,
						now: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS Z'),
						id: user.id,
					},
				});
			}

			return { points_added: pointsToAdd, points_total: user.points + pointsToAdd };
		} catch (e) {
			console.log('[ERROR][GameService][claimBonus] ', e);
			throw e;
		}
	}
}
