import dayjs from 'dayjs';

import { User } from '../models/models';
import UserInterface from '../types/user.interface';

export default class GameService {
	static async play(user: UserInterface) {
		try {
			const lastGameHourSig = dayjs(user.lastGame || 0).format('YYYY-MM-DD-HH');
			const currentHourSig = dayjs().format('YYYY-MM-DD-HH');

			if (lastGameHourSig === currentHourSig) {
				if (user?.gamesPlayedLastHour && user?.gamesPlayedLastHour >= 5) {
					throw 'limit_exceeded';
				} else {
					await User.increment('gamesPlayedLastHour', { by: 1, where: { id: user.id } });
				}
			} else {
				await User.update({ gamesPlayedLastHour: 1 }, { where: { id: user.id } });
			}

			const pointsToAdd = Math.floor(Math.random() * 100);

			await User.increment('points', { by: pointsToAdd, where: { id: user.id } });
			await User.update({ lastGame: Date.now() }, { where: { id: user.id } });

			return { points_added: pointsToAdd, points_total: (user?.points as number) + pointsToAdd };
		} catch (e) {
			console.log('[ERROR][GameService][play] ', e);
			throw e;
		}
	}

	static async claimBonus(user: UserInterface) {
		try {
			const lastClaim = user.lastClaim;
			const pointsAllowed = dayjs(lastClaim).diff(dayjs(), 'minutes', false) * -10;
			const pointsToAdd = Math.min(100, pointsAllowed);

			if (pointsToAdd > 0) {
				await User.increment('points', { by: pointsToAdd, where: { id: user.id } });
				await User.update({ lastClaim: Date.now() }, { where: { id: user.id } });
			}

			return { points_added: pointsToAdd, points_total: user.points + pointsToAdd };
		} catch (e) {
			console.log('[ERROR][GameService][claimBonus] ', e);
			throw e;
		}
	}
}
