import express from 'express';

export const now = (req: express.Request, res: express.Response) => {
	return res.status(200).json({ timestamp: Date.now() });
};
