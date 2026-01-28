import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { executeCode } from '../services/codeExecution.js';

export const submissionsRouter = Router();

// Submit code
submissionsRouter.post('/', async (req, res) => {
    try {
        const { userId, teamId, matchId, roundId, problemId, code, language } = req.body;

        // Validate required fields
        if (!problemId) {
            return res.status(400).json({ error: 'Problem ID is required' });
        }
        if (!code || code.trim().length === 0) {
            return res.status(400).json({ error: 'Code is required' });
        }
        if (!language) {
            return res.status(400).json({ error: 'Language is required' });
        }

        // Get problem for test cases FIRST (before creating submission)
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
        });

        if (!problem) {
            return res.status(400).json({ error: 'Problem not found' });
        }

        // Create submission (allow null userId/teamId for anonymous testing)
        const submission = await prisma.submission.create({
            data: {
                userId: userId || null,
                teamId: teamId || null,
                matchId: matchId || null,
                roundId: roundId || null,
                problemId,
                code,
                language,
                status: 'running',
            },
        });

        // Execute code against test cases
        const testCases = JSON.parse(problem.testCases);
        const result = await executeCode(code, language, testCases);

        // Update submission with result
        const updatedSubmission = await prisma.submission.update({
            where: { id: submission.id },
            data: {
                status: result.passed ? 'accepted' : 'wrong_answer',
                runtime: result.runtime,
                memory: result.memory,
            },
        });

        res.json({
            submission: updatedSubmission,
            result: {
                passed: result.passed,
                passedCount: result.passedCount,
                totalCount: result.totalCount,
                runtime: result.runtime,
                error: result.error,
            },
        });
    } catch (error) {
        console.error('Submit code error:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
});

// Get submission by ID
submissionsRouter.get('/:id', async (req, res) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, username: true } },
                team: { select: { id: true, name: true } },
                problem: { select: { id: true, title: true } },
            },
        });

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get submissions for a match
submissionsRouter.get('/match/:matchId', async (req, res) => {
    try {
        const submissions = await prisma.submission.findMany({
            where: { matchId: req.params.matchId },
            include: {
                user: { select: { id: true, username: true } },
                team: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(submissions);
    } catch (error) {
        console.error('Get match submissions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
