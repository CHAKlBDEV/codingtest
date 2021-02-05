import {User} from '../models/models';
import jwt from 'jsonwebtoken';

export default class UserService {
    static async register(name: string) {
        try {
            const usersWithSameName = (await User.count({ where: { name } })) != 0;
            if (usersWithSameName) {
                throw 'name_already_taken';
            }

            let user = await User.create({ name });

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || '', { expiresIn: '1d' });

            return { token };
        } catch (e) {
            console.log('[ERROR][UserService][register] ', e);
            throw e;
        }
    }

    static async getUserData(userId: string) {
        try {
            const user = await User.findOne({ where: { id: userId }, attributes: ['name', 'points'] });
            return { name: user?.name, points: user?.points };
        } catch (e) {
            console.log('[ERROR][UserService][getUserData] ', e);
            throw e;
        }
    }
}