import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config';
import GameInterface from '../types/game.interface';
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
});

export const Game = sequelize.define<GameInterface>('game', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		allowNull: false,
		primaryKey: true,
	},
	user: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	date: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
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
