import dayjs from 'dayjs';

import { User } from '../models/models';

export default class GameService {
	static async play(userId: string) {
		try {
			let user = await User.findByPk(userId);

			const lastGameHourSig = dayjs(user?.lastGame || 0).format('YYYY-MM-DD-HH');
			const currentHourSig = dayjs().format('YYYY-MM-DD-HH');

			if (lastGameHourSig === currentHourSig) {
				if (user?.gamesPlayedLastHour && user?.gamesPlayedLastHour >= 5) {
					throw 'limit_exceeded';
				} else {
					await User.increment('gamesPlayedLastHour', { by: 1, where: { id: userId } });
				}
			} else {
				await User.update({ gamesPlayedLastHour: 1 }, { where: { id: userId } });
			}

			const pointsToAdd = Math.floor(Math.random() * 100);

			await User.increment('points', { by: pointsToAdd, where: { id: userId } });
			await User.update({ lastGame: Date.now() }, { where: { id: userId } });

			return { points_added: pointsToAdd, points_total: (user?.points as number) + pointsToAdd };
		} catch (e) {
			console.log('[ERROR][GameService][play] ', e);
			throw e;
		}
	}

	static async claimBonus(userId: string) {
		try {
			const lastClaim = (await User.findByPk(userId))?.lastClaim;
			const pointsAllowed = dayjs(lastClaim).diff(dayjs(), 'minutes', false) * -10;
			const pointsToAdd = Math.min(100, pointsAllowed);

			if (pointsToAdd > 0) {
				await User.increment('points', { by: pointsToAdd, where: { id: userId } });
				await User.update({ lastClaim: Date.now() }, { where: { id: userId } });
			}

			const user = await User.findByPk(userId);

			return { points_added: pointsToAdd, points_total: user?.points };
		} catch (e) {
			console.log('[ERROR][GameService][claimBonus] ', e);
			throw e;
		}
	}
}
