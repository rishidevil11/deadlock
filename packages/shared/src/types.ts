// ============================================
// User Types
// ============================================

export interface User {
    id: string;
    username: string;
    teamId: string | null;
    teamName?: string;
    isAdmin: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// ============================================
// Team Types
// ============================================

export interface Team {
    id: string;
    name: string;
    score: number;
    members: Pick<User, 'id' | 'username'>[];
}

export interface TeamLeaderboard {
    id: string;
    name: string;
    score: number;
    memberCount: number;
}

// ============================================
// Game Types
// ============================================

export type GameType = 'deadlock' | 'crack-the-code';
export type MatchStatus = 'waiting' | 'active' | 'completed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SubmissionStatus = 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'error';

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    testCases: TestCase[];
    gameType: GameType;
}

export interface TestCase {
    input: string;
    expected: string;
    isPublic: boolean;
}

export interface Match {
    id: string;
    gameType: GameType;
    status: MatchStatus;
    teamA: Team | null;
    teamB: Team | null;
    winner: Team | null;
    startedAt: Date | null;
    endedAt: Date | null;
    rounds: Round[];
}

export interface Round {
    id: string;
    matchId: string;
    problemId: string;
    problem: Problem;
    roundNum: number;
    status: 'pending' | 'active' | 'completed';
    startedAt: Date | null;
    endedAt: Date | null;
}

export interface Submission {
    id: string;
    userId: string;
    teamId: string;
    matchId: string;
    roundId: string | null;
    problemId: string;
    code: string;
    language: string;
    status: SubmissionStatus;
    runtime: number | null;
    memory: number | null;
    createdAt: Date;
}

export interface SubmissionResult {
    passed: boolean;
    passedCount: number;
    totalCount: number;
    runtime: number;
    error?: string;
}

// ============================================
// DeadLock Game State
// ============================================

export interface DeadLockState {
    matchId: string;
    position: number; // -100 to 100, 0 is center
    teamAScore: number;
    teamBScore: number;
    currentRound: number;
    totalRounds: number;
    timeRemaining: number;
}

// ============================================
// Crack the Code Game State
// ============================================

export interface CrackTheCodeState {
    matchId: string;
    problemId: string;
    attemptsUsed: number;
    maxAttempts: number;
    timeRemaining: number;
    testResults: { input: string; output: string }[];
}

// ============================================
// Socket Events
// ============================================

export interface ServerToClientEvents {
    'player:joined': (data: { matchId: string; teamId: string; userId: string }) => void;
    'submission:new': (data: { matchId: string; teamId: string; submissionId: string }) => void;
    'submission:complete': (data: { matchId: string; teamId: string; submissionId: string; passed: boolean }) => void;
    'game:update': (data: { matchId: string; teamId: string; event: string }) => void;
    'game:progress': (data: { matchId: string; position: number }) => void;
    'round:started': (data: { matchId: string; roundNum: number; problemId: string }) => void;
    'round:ended': (data: { matchId: string; roundNum: number; winnerId?: string }) => void;
    'match:ended': (data: { matchId: string; winnerId: string }) => void;
    'chat:message': (data: { type: 'team' | 'match'; teamId: string; userId: string; message: string; timestamp: string }) => void;
}

export interface ClientToServerEvents {
    'join:game': (data: { matchId: string; teamId: string; userId: string }) => void;
    'leave:game': (data: { matchId: string }) => void;
    'submit:code': (data: { matchId: string; teamId: string; submissionId: string }) => void;
    'submission:result': (data: { matchId: string; teamId: string; submissionId: string; passed: boolean }) => void;
    'game:progress': (data: { matchId: string; position: number }) => void;
    'round:start': (data: { matchId: string; roundNum: number; problemId: string }) => void;
    'round:end': (data: { matchId: string; roundNum: number; winnerId?: string }) => void;
    'match:end': (data: { matchId: string; winnerId: string }) => void;
    'chat:team': (data: { teamId: string; userId: string; message: string }) => void;
}
