import { QueryTypes } from 'sequelize';

import sequelize from '../config/db.config';
import { User } from '../models/models';

export default class LeaderBoardService {
	static async getLeaderBoard(userId: string | null) {
		try {
			let leaders = await sequelize.query('SELECT name, points, ROW_NUMBER() OVER (ORDER BY points DESC) as place FROM users LIMIT 10', {
				type: QueryTypes.SELECT,
			});

			let responseObject: any = { leaders };

			if (userId) {
				let user = await User.findByPk(userId);
				let getUserRank = await sequelize.query('SELECT COUNT(*) + 1 AS rank FROM users WHERE points > :points', {
					replacements: { points: user?.points },
					type: QueryTypes.SELECT,
				});
				responseObject.current_user_place = (getUserRank as any)[0].rank;
			}

			return responseObject;
		} catch (e) {
			console.log('[ERROR][LeaderboardService][getLeaderBoard] ', e);
			throw e;
		}
	}
}
