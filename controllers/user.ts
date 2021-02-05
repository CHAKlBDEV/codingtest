import express from 'express';
import { validationResult } from 'express-validator';

import UserService from '../services/user';

export const register = async (req: express.Request, res: express.Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ message: 'name_invalid_or_missing' });
	}
	const { name } = req.body;
	try {
        let response = await UserService.register(name);
        return res.status(200).json({message: 'user_registered_successfully', ...response});
	} catch (e) {
        console.log('[ERROR][/register] ', e);
        switch (e) {
            case 'name_already_taken':
                return res.status(409).json({ message: e });
            default:
                return res.status(500).json({ message: 'server_error' });
        }
	}
};

export const me = async (req: express.Request, res: express.Response) => {
	try {
		let response = await UserService.getUserData(req.userObject?.id);
		return res.status(200).json(response);
	} catch (e) {
		console.log('[ERROR][/me] ', e);
		return res.status(500).json({ message: 'server_error' });
	}
};
