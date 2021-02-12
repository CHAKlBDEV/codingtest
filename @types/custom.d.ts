import * as express from 'express';
import UserInterface from '../types/user.interface';

declare global {
	namespace Express {
		interface Request {
			userObject?: UserInterface;
		}
	}
}
