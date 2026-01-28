import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const gamesRouter = Router();

// Get active matches
gamesRouter.get('/matches', async (req, res) => {
    try {
        const { gameType, status } = req.query;

        const matches = await prisma.match.findMany({
            where: {
                ...(gameType && { gameType: gameType as string }),
                ...(status && { status: status as string }),
            },
            include: {
                teamA: { select: { id: true, name: true } },
                teamB: { select: { id: true, name: true } },
                winner: { select: { id: true, name: true } },
                _count: { select: { rounds: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(matches);
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get match by ID
gamesRouter.get('/matches/:id', async (req, res) => {
    try {
        const match = await prisma.match.findUnique({
            where: { id: req.params.id },
            include: {
                teamA: { include: { members: { select: { id: true, username: true } } } },
                teamB: { include: { members: { select: { id: true, username: true } } } },
                rounds: {
                    include: { problem: true },
                    orderBy: { roundNum: 'asc' },
                },
            },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        res.json(match);
    } catch (error) {
        console.error('Get match error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new match
gamesRouter.post('/matches', async (req, res) => {
    try {
        const { gameType, teamAId, teamBId } = req.body;

        const match = await prisma.match.create({
            data: {
                gameType,
                teamAId,
                teamBId,
            },
            include: {
                teamA: true,
                teamB: true,
            },
        });

        res.status(201).json(match);
    } catch (error) {
        console.error('Create match error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start match
gamesRouter.post('/matches/:id/start', async (req, res) => {
    try {
        const match = await prisma.match.update({
            where: { id: req.params.id },
            data: {
                status: 'active',
                startedAt: new Date(),
            },
        });

        res.json(match);
    } catch (error) {
        console.error('Start match error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// End match
gamesRouter.post('/matches/:id/end', async (req, res) => {
    try {
        const { winnerId } = req.body;

        const match = await prisma.match.update({
            where: { id: req.params.id },
            data: {
                status: 'completed',
                winnerId,
                endedAt: new Date(),
            },
        });

        res.json(match);
    } catch (error) {
        console.error('End match error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
