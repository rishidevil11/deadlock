// ============================================
// Game Configuration
// ============================================

export const GAME_CONFIG = {
    deadlock: {
        maxTeams: 2,
        teamSize: 3,
        roundDuration: 300, // 5 minutes in seconds
        totalRounds: 5,
        ropeLength: 100, // -100 to 100 scale
        pointsPerSolve: 20,
    },
    crackTheCode: {
        maxTeams: 10,
        teamSize: 3,
        timeLimit: 1800, // 30 minutes in seconds
        maxAttempts: 50,
        pointsPerSolve: 100,
    },
} as const;

// ============================================
// Supported Languages
// ============================================

export const SUPPORTED_LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'cpp', name: 'C++', extension: '.cpp' },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['id'];

// ============================================
// Difficulty Settings
// ============================================

export const DIFFICULTY_CONFIG = {
    easy: {
        timeMultiplier: 1.5,
        points: 50,
        color: '#22c55e', // green
    },
    medium: {
        timeMultiplier: 1.0,
        points: 100,
        color: '#eab308', // yellow
    },
    hard: {
        timeMultiplier: 0.75,
        points: 200,
        color: '#ef4444', // red
    },
} as const;
