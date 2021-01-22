import jwt from 'jsonwebtoken';
import { User } from '../models/models';

export default (required = true) => {
	return async (req: any, res: any, next: any) => {
		if (!req.get('Authorization')) {
			if (required) {
				return res.status(401).json({ message: 'unauthorized' });
			} else {
				next();
				return;
			}
		}

		let authHeader = req.get('Authorization').split(' ');
		if (authHeader.length < 2 || authHeader[0] !== 'Bearer') return res.status(401).json({ message: 'invalid_token' });
		let token = authHeader[1];

		try {
			let user: any = jwt.verify(token, process.env.JWT_SECRET || '');
			if (!(await User.findByPk(user.id))) {
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
