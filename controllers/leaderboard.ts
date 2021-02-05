import express from 'express';

import LeaderBoardService from '../services/leaderboard';

export const leaderboard = async (req: express.Request, res: express.Response) => {
	try {
		let response = await LeaderBoardService.getLeaderBoard(!!req.userObject ? req.userObject.id : null);
		return res.status(200).json(response);
	} catch (e) {
		console.log('[ERROR][/leaderboard] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
};
