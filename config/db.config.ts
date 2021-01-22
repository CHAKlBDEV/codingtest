import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');

const testConnection = async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error: any) {
		console.error('Unable to connect to the database:', error);
	}
};

testConnection();

export default sequelize;
