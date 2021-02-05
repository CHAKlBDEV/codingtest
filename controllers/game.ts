import express from 'express';
import dayjs from 'dayjs';

import { User } from '../models/models';

export const play = async (req: express.Request, res: express.Response) => {
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

		return res.status(200).json({ points_added: pointsToAdd, points_total: (user?.points as number) + pointsToAdd });
	} catch (e) {
		console.log('[ERROR][/game/play] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
};

export const claimBonus = async (req: express.Request, res: express.Response) => {
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
};
