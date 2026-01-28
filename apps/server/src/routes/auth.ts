import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const authRouter = Router();

// Login
authRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { username },
            include: { team: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, teamId: user.teamId },
            process.env.JWT_SECRET || 'dev-secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                teamId: user.teamId,
                teamName: user.team?.name,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register
authRouter.post('/register', async (req, res) => {
    try {
        const { username, password, teamId } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                teamId,
            },
            include: { team: true },
        });

        const token = jwt.sign(
            { userId: user.id, teamId: user.teamId },
            process.env.JWT_SECRET || 'dev-secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                teamId: user.teamId,
                teamName: user.team?.name,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user
authRouter.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET || 'dev-secret'
        ) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: { team: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            teamId: user.teamId,
            teamName: user.team?.name,
            isAdmin: user.isAdmin,
        });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});
