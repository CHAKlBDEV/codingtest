import { Model } from 'sequelize';

export default interface GameInterface extends Model {
	id: string;
	user: string;
	date: Date;
}