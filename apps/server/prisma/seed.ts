import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Admins and Default Users
    const password = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password,
            isAdmin: true,
        },
    });
    console.log('✅ Admin user created');

    // 2. Create Teams
    const teams = ['Team Alpha', 'Team Beta'];
    for (const name of teams) {
        await prisma.team.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log('✅ Teams created');

    // 3. Seed DeadLock Problems (LeetCode Style)
    const deadlockProblems = [
        {
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            difficulty: 'easy',
            testCases: JSON.stringify([
                { input: '[2,7,11,15], 9', expected: '[0,1]', isPublic: true },
                { input: '[3,2,4], 6', expected: '[1,2]', isPublic: true },
                { input: '[3,3], 6', expected: '[0,1]', isPublic: false },
            ]),
            solution: 'def solve(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i',
        },
        {
            title: 'Palindrome Number',
            description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
            difficulty: 'easy',
            testCases: JSON.stringify([
                { input: '121', expected: 'true', isPublic: true },
                { input: '-121', expected: 'false', isPublic: true },
                { input: '10', expected: 'false', isPublic: true },
                { input: '12321', expected: 'true', isPublic: false },
            ]),
            solution: 'def solve(x):\n    return str(x) == str(x)[::-1]',
        },
        {
            title: 'Valid Parentheses',
            description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
            difficulty: 'medium',
            testCases: JSON.stringify([
                { input: '"()"', expected: 'true', isPublic: true },
                { input: '"()[]{}"', expected: 'true', isPublic: true },
                { input: '"(]"', expected: 'false', isPublic: true },
                { input: '"([)]"', expected: 'false', isPublic: false },
            ]),
            solution: 'def solve(s):\n    stack = []\n    map = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in map:\n            top = stack.pop() if stack else "#"\n            if map[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack',
        },
        {
            title: 'Climbing Stairs',
            description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
            difficulty: 'easy',
            testCases: JSON.stringify([
                { input: '2', expected: '2', isPublic: true },
                { input: '3', expected: '3', isPublic: true },
                { input: '5', expected: '8', isPublic: false },
            ]),
            solution: 'def solve(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b',
        },
        {
            title: 'Best Time to Buy and Sell Stock',
            description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
            difficulty: 'easy',
            testCases: JSON.stringify([
                { input: '[7,1,5,3,6,4]', expected: '5', isPublic: true },
                { input: '[7,6,4,3,1]', expected: '0', isPublic: true },
            ]),
            solution: 'def solve(prices):\n    min_price = float("inf")\n    max_profit = 0\n    for p in prices:\n        min_price = min(min_price, p)\n        max_profit = max(max_profit, p - min_price)\n    return max_profit',
        }
    ];

    for (const p of deadlockProblems) {
        await prisma.problem.create({
            data: {
                ...p,
                gameType: 'deadlock',
            },
        });
    }
    console.log('✅ DeadLock problems seeded');

    // 4. Seed Crack the Code (Reverse Engineering)
    await prisma.problem.create({
        data: {
            title: 'Mystery Function 1',
            description: 'Reverse engineer this function based on inputs and outputs.',
            difficulty: 'medium',
            gameType: 'crack-the-code',
            // The mystery is: f(x) = x^2 + x - 1
            testCases: JSON.stringify([
                { input: '1', expected: '1', isPublic: true }, // 1+1-1=1
                { input: '2', expected: '5', isPublic: true }, // 4+2-1=5
                { input: '5', expected: '29', isPublic: true }, // 25+5-1=29
                { input: '10', expected: '109', isPublic: false },
                { input: '0', expected: '-1', isPublic: false },
            ]),
            solution: 'def solve(x):\n    return x**2 + x - 1',
        },
    });
    console.log('✅ Crack the Code problem seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
