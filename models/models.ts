import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config';
import UserInterface from '../types/user.interface';

export const User = sequelize.define<UserInterface>('user', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		allowNull: false,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	points: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
	registered: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
	lastClaim: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
	lastGame: {
		type: DataTypes.DATE,
	},
	gamesPlayedLastHour: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
});

sequelize.sync({ alter: true }).then(
	() => {
		console.log('Tables synced successfully');
	},
	(err) => {
		console.log(err);
	}
);
