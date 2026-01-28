import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const problemsRouter = Router();

// Get all problems
problemsRouter.get('/', async (req, res) => {
    try {
        const { gameType, difficulty } = req.query;

        const problems = await prisma.problem.findMany({
            where: {
                ...(gameType && { gameType: gameType as string }),
                ...(difficulty && { difficulty: difficulty as string }),
            },
            select: {
                id: true,
                title: true,
                difficulty: true,
                gameType: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(problems);
    } catch (error) {
        console.error('Get problems error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get problem by ID
problemsRouter.get('/:id', async (req, res) => {
    try {
        const problem = await prisma.problem.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                gameType: true,
                testCases: true,
                // Note: solution is NOT returned to prevent cheating
            },
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Parse test cases but only return public ones
        const testCases = JSON.parse(problem.testCases);
        const publicTestCases = testCases.filter((tc: { isPublic: boolean }) => tc.isPublic);

        res.json({
            ...problem,
            testCases: publicTestCases,
        });
    } catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create problem (admin only)
problemsRouter.post('/', async (req, res) => {
    try {
        const { title, description, difficulty, testCases, solution, gameType } = req.body;

        const problem = await prisma.problem.create({
            data: {
                title,
                description,
                difficulty,
                testCases: JSON.stringify(testCases),
                solution,
                gameType,
            },
        });

        res.status(201).json(problem);
    } catch (error) {
        console.error('Create problem error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
