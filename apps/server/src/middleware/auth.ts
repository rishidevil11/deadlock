import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: string;
    teamId?: string;
}

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET || 'dev-secret'
        ) as { userId: string; teamId: string };

        req.userId = payload.userId;
        req.teamId = payload.teamId;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
