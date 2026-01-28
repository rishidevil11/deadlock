import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const teamsRouter = Router();

// Get all teams
teamsRouter.get('/', async (_req, res) => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                members: {
                    select: { id: true, username: true },
                },
                _count: {
                    select: { members: true },
                },
            },
            orderBy: { score: 'desc' },
        });

        res.json(teams);
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get team by ID
teamsRouter.get('/:id', async (req, res) => {
    try {
        const team = await prisma.team.findUnique({
            where: { id: req.params.id },
            include: {
                members: {
                    select: { id: true, username: true },
                },
                submissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json(team);
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create team (admin only)
teamsRouter.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        const team = await prisma.team.create({
            data: { name },
        });

        res.status(201).json(team);
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Leaderboard
teamsRouter.get('/leaderboard/all', async (_req, res) => {
    try {
        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                score: true,
                _count: {
                    select: { members: true },
                },
            },
            orderBy: { score: 'desc' },
        });

        res.json(teams);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
