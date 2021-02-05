import express from 'express';

import GameService from '../services/game';

export const play = async (req: express.Request, res: express.Response) => {
	try {
        let response = await GameService.play(req.userObject?.id);
        return res.status(200).json(response);
	} catch (e) {
        console.log('[ERROR][/game/play] ', e);
        switch (e) {
            case 'limit_exceeded':
                return res.status(401).json({message: e});
            default:
                return res.status(500).json({ message: 'server_error' });
        }
	}
};

export const claimBonus = async (req: express.Request, res: express.Response) => {
	try {
        let response = await GameService.claimBonus(req.userObject?.id);
        return res.status(200).json(response);
	} catch (e) {
		console.log('[ERROR][/game/claim_bonus] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
};
