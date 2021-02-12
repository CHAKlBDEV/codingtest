import jwt from 'jsonwebtoken';
import express, { NextFunction } from 'express';
import { User } from '../models/models';

export default (required = true) => {
	return async (req: express.Request, res: express.Response, next: NextFunction) => {
		const authorization = req.get('Authorization');
		if (!authorization) {
			if (required) {
				return res.status(401).json({ message: 'unauthorized' });
			} else {
				next();
				return;
			}
		}

		let authHeader = authorization.split(' ');
		if (authHeader.length < 2 || authHeader[0] !== 'Bearer') return res.status(401).json({ message: 'invalid_token' });
		let token = authHeader[1];

		try {
			let userJwtObject: any = jwt.verify(token, process.env.JWT_SECRET || '');
			let user = await User.findByPk(userJwtObject.id);
			if (!user) {
				return res.status(401).json({ message: 'invalid_user' });
			}
			req.userObject = user;
			next();
			return;
		} catch (e) {
			return res.status(401).json({ message: 'unauthorized' });
		}
	};
};
