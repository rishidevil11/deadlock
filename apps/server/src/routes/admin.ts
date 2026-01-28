import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const adminRouter = Router();

// Get all users
adminRouter.get('/users', async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                teamId: true,
            },
            orderBy: { username: 'asc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user's team
adminRouter.put('/users/:id/team', async (req, res) => {
    try {
        const { teamId } = req.body;

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { teamId: teamId || null },
            select: {
                id: true,
                username: true,
                teamId: true,
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Update user team error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete team (and unassign all members)
adminRouter.delete('/teams/:id', async (req, res) => {
    try {
        // First unassign all users from this team
        await prisma.user.updateMany({
            where: { teamId: req.params.id },
            data: { teamId: null }
        });

        // Delete the team
        await prisma.team.delete({
            where: { id: req.params.id }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all matches
adminRouter.get('/matches', async (_req, res) => {
    try {
        const matches = await prisma.match.findMany({
            include: {
                teamA: { select: { id: true, name: true } },
                teamB: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(matches);
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
