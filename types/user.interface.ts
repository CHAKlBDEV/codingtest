import { Model } from 'sequelize';

export default interface UserInterface extends Model {
	id: string;
	name: string;
	points: number;
	registered: Date;
	lastClaim: Date;
	lastGame: Date;
	gamesPlayedLastHour: number;
}