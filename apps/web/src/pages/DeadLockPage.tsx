import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Zap, Play, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// Global socket instance
let socket: Socket;

interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    testCases: string;
}

interface GameState {
    matchId: string;
    teamA: { id: string; name: string } | null;
    teamB: { id: string; name: string } | null;
    position: number; // -100 (Team A wins) to +100 (Team B wins)
    round: number;
    problem: Problem | null;
}

export function DeadLockPage() {
    const { matchId } = useParams();
    const [code, setCode] = useState(`// Write your solution here

function twoSum(nums, target) {
    // Your code here
    
}
`);
    const [language, setLanguage] = useState('javascript');
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<any>(null);
    const [gameState, setGameState] = useState<GameState>({
        matchId: matchId || '',
        teamA: null,
        teamB: null,
        position: 0,
        round: 1,
        problem: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isTeamA = currentUser.teamId === gameState.teamA?.id;
    const isTeamB = currentUser.teamId === gameState.teamB?.id;

    // Initialize socket and fetch match data
    useEffect(() => {
        // Connect to socket
        socket = io(window.location.origin, {
            path: '/socket.io',
            transports: ['websocket', 'polling']
        });

        // Fetch match data
        const fetchMatch = async () => {
            try {
                const res = await fetch(`/api/games/matches/${matchId}`);
                const data = await res.json();

                if (data.error) {
                    toast.error(data.error);
                    return;
                }

                const problem = data.rounds?.[0]?.problem || null;

                setGameState({
                    matchId: data.id,
                    teamA: data.teamA,
                    teamB: data.teamB,
                    position: 0,
                    round: data.rounds?.length || 1,
                    problem
                });

                // Join the game room
                if (currentUser.id && currentUser.teamId) {
                    socket.emit('join:game', {
                        matchId,
                        teamId: currentUser.teamId,
                        userId: currentUser.id
                    });
                }
            } catch (err) {
                console.error('Failed to fetch match:', err);
                toast.error('Failed to load game');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatch();

        // Listen for game updates
        socket.on('game:progress', (data: { matchId: string; position: number }) => {
            if (data.matchId === matchId) {
                setGameState(prev => ({ ...prev, position: data.position }));
            }
        });

        socket.on('submission:complete', (data: any) => {
            if (data.matchId === matchId) {
                const direction = data.teamId === gameState.teamA?.id ? -10 : 10;
                if (data.passed) {
                    setGameState(prev => {
                        const newPos = Math.max(-100, Math.min(100, prev.position + direction));
                        // Broadcast position update
                        socket.emit('game:progress', { matchId, position: newPos });
                        return { ...prev, position: newPos };
                    });
                }
            }
        });

        // Timer
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => {
            socket.off('game:progress');
            socket.off('submission:complete');
            socket.disconnect();
            clearInterval(timer);
        };
    }, [matchId]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (!gameState.problem) {
            toast.error('No problem loaded');
            return;
        }

        setIsRunning(true);
        setOutput(null);

        try {
            const payload = {
                userId: currentUser.id,
                teamId: currentUser.teamId,
                matchId,
                problemId: gameState.problem.id,
                code,
                language
            };

            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.error) {
                toast.error(data.error);
                setOutput({ error: data.error });
                return;
            }

            setOutput(data.result);

            if (data.result.passed) {
                toast.success('All Test Cases Passed! 🎉');

                // Update tug of war position
                const direction = isTeamA ? -15 : 15;
                const newPosition = Math.max(-100, Math.min(100, gameState.position + direction));

                // Emit to all clients
                socket.emit('game:progress', { matchId, position: newPosition });
                setGameState(prev => ({ ...prev, position: newPosition }));
            } else {
                toast.error(`Failed: ${data.result.passedCount}/${data.result.totalCount} tests passed`);
            }

        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Submission failed');
            setOutput({ error: 'Network error' });
        } finally {
            setIsRunning(false);
        }
    };

    const getTestCases = () => {
        if (!gameState.problem?.testCases) return [];
        try {
            return JSON.parse(gameState.problem.testCases).filter((tc: any) => tc.isPublic);
        } catch {
            return [];
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-dark-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-dark-400">Loading game...</p>
                </div>
            </div>
        );
    }

    const tugPosition = 50 + (gameState.position / 2); // Convert -100..100 to 0..100

    return (
        <div className="h-screen flex flex-col bg-dark-900 overflow-hidden">
            {/* Game Header */}
            <div className="glass border-b border-dark-700/50 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary-400" />
                        <span className="font-bold text-lg">DeadLock</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isTeamA ? 'bg-blue-500/20 text-blue-400' : isTeamB ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-dark-400'
                        }`}>
                        {isTeamA ? gameState.teamA?.name : isTeamB ? gameState.teamB?.name : 'Spectator'}
                    </div>
                </div>

                {/* Tug of War Indicator */}
                <div className="flex items-center gap-4 flex-1 max-w-2xl mx-8">
                    <span className={`font-bold truncate w-28 text-right ${tugPosition < 40 ? 'text-blue-400 scale-110' : 'text-blue-400/70'}`}>
                        {gameState.teamA?.name || 'Team A'}
                    </span>
                    <div className="flex-1 h-4 bg-dark-700 rounded-full overflow-hidden relative">
                        {/* Blue side */}
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                            style={{ width: `${tugPosition}%` }}
                        />
                        {/* Red side */}
                        <div
                            className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-600 to-red-400 transition-all duration-500"
                            style={{ width: `${100 - tugPosition}%` }}
                        />
                        {/* Center marker */}
                        <div className="absolute inset-y-0 left-1/2 w-1 bg-white -translate-x-1/2 z-10 shadow-lg" />
                        {/* Current position indicator */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg transition-all duration-500 z-20"
                            style={{ left: `calc(${tugPosition}% - 12px)` }}
                        />
                    </div>
                    <span className={`font-bold truncate w-28 ${tugPosition > 60 ? 'text-red-400 scale-110' : 'text-red-400/70'}`}>
                        {gameState.teamB?.name || 'Team B'}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-dark-400">
                        <Clock className="w-5 h-5" />
                        <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-400 animate-pulse' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-dark-800 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Round {gameState.round}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Problem Panel */}
                <div className="w-[420px] border-r border-dark-700 overflow-y-auto bg-dark-800/50">
                    {gameState.problem ? (
                        <div className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${gameState.problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                    gameState.problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                        'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                    {gameState.problem.difficulty.toUpperCase()}
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold mb-4">{gameState.problem.title}</h2>

                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-dark-300 whitespace-pre-wrap leading-relaxed">
                                    {gameState.problem.description}
                                </p>

                                {getTestCases().length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-white font-bold mb-3">Example Test Cases</h3>
                                        <div className="space-y-3">
                                            {getTestCases().map((tc: any, i: number) => (
                                                <div key={i} className="bg-dark-900 p-4 rounded-lg font-mono text-sm border border-dark-700">
                                                    <div className="mb-2">
                                                        <span className="text-dark-500 text-xs">INPUT</span>
                                                        <div className="text-green-400">{tc.input}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-dark-500 text-xs">EXPECTED OUTPUT</span>
                                                        <div className="text-blue-400">{tc.expected}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-dark-500">
                                <XCircle className="w-12 h-12 mx-auto mb-4" />
                                <p>No problem loaded</p>
                                <p className="text-sm">Run npm run db:seed to add problems</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* Output Console */}
                    {output && (
                        <div className="h-40 bg-dark-950 border-t border-dark-700 p-4 font-mono text-sm overflow-auto shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-dark-400 flex items-center gap-2">
                                    {output.passed ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                    Result
                                </span>
                                <span className={`font-bold ${output.passed ? "text-green-400" : "text-red-400"}`}>
                                    {output.passed ? "ACCEPTED" : "WRONG ANSWER"}
                                </span>
                            </div>
                            {output.error ? (
                                <pre className="text-red-400 whitespace-pre-wrap">{output.error}</pre>
                            ) : (
                                <div className="space-y-1 text-dark-300">
                                    <div>Runtime: <span className="text-white">{output.runtime || 0}ms</span></div>
                                    <div>Test Cases: <span className={output.passed ? "text-green-400" : "text-red-400"}>{output.passedCount}/{output.totalCount}</span></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Editor Footer */}
                    <div className="glass border-t border-dark-700/50 px-6 py-3 flex items-center justify-between bg-dark-800 shrink-0">
                        <div className="flex items-center gap-4">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="input py-2 w-44 bg-dark-900 border-dark-600"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={isRunning || !gameState.problem}
                                className="btn-primary px-8 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isRunning ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Play className="w-5 h-5" />
                                )}
                                {isRunning ? 'Running...' : 'Submit Solution'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
