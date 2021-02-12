import { QueryTypes } from 'sequelize';

import sequelize from '../config/db.config';
import { User } from '../models/models';
import UserInterface from '../types/user.interface';

export default class LeaderBoardService {
	static async getLeaderBoard(user: UserInterface | undefined) {
		try {
			let leaders = await sequelize.query('SELECT name, points, ROW_NUMBER() OVER (ORDER BY points DESC) as place FROM users LIMIT 10', {
				type: QueryTypes.SELECT,
			});

			let responseObject: any = { leaders };

			if (user) {
				let getUserRank = await sequelize.query<{ place: number }>(
					'WITH ranking AS (SELECT id, ROW_NUMBER() OVER (ORDER BY points DESC) as place FROM users WHERE points >= :points) SELECT place FROM ranking WHERE id = :id',
					{
						replacements: { id: user.id, points: user.points },
						type: QueryTypes.SELECT,
					}
				);
				if (getUserRank.length !== 1) {
					throw 'invalid_data';
				}
				responseObject.current_user_place = getUserRank[0].place;
			}

			return responseObject;
		} catch (e) {
			console.log('[ERROR][LeaderboardService][getLeaderBoard] ', e);
			throw e;
		}
	}
}
