import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Zap, Timer, Users } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

interface GameState {
    teamA: { name: string; score: number };
    teamB: { name: string; score: number };
    position: number;
    round: number;
    timeLeft: number;
    lastEvent: string | null;
}

export function AdminProjectorPage() {
    const { matchId } = useParams();
    const [gameState, setGameState] = useState<GameState>({
        teamA: { name: 'Team Alpha', score: 0 },
        teamB: { name: 'Team Beta', score: 0 },
        position: 0,
        round: 1,
        timeLeft: 300,
        lastEvent: null,
    });
    const [events, setEvents] = useState<string[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particleSystem = useRef<any[]>([]);

    useEffect(() => {
        // Connect socket
        socket = io(window.location.origin, {
            path: '/socket.io',
            transports: ['websocket', 'polling']
        });

        // Fetch match data
        const fetchMatch = async () => {
            try {
                const res = await fetch(`/api/games/matches/${matchId}`);
                const data = await res.json();
                if (data.teamA && data.teamB) {
                    setGameState(prev => ({
                        ...prev,
                        teamA: { name: data.teamA.name, score: 0 },
                        teamB: { name: data.teamB.name, score: 0 },
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch match:', err);
            }
        };

        fetchMatch();

        // Join as admin viewer
        socket.emit('join:game', { matchId, teamId: 'admin', userId: 'admin' });

        socket.on('game:progress', (data: { matchId: string; position: number }) => {
            if (data.matchId === matchId) {
                setGameState(prev => ({ ...prev, position: data.position }));
                createParticles(data.position > gameState.position ? 1 : -1);
            }
        });

        socket.on('submission:complete', (data: any) => {
            if (data.matchId === matchId) {
                const eventText = `${data.passed ? '✅' : '❌'} Submission ${data.passed ? 'ACCEPTED' : 'REJECTED'}`;
                setEvents(prev => [eventText, ...prev].slice(0, 5));
                setGameState(prev => ({
                    ...prev,
                    lastEvent: eventText
                }));
            }
        });

        // Timer countdown
        const timer = setInterval(() => {
            setGameState(prev => ({
                ...prev,
                timeLeft: Math.max(0, prev.timeLeft - 1)
            }));
        }, 1000);

        return () => {
            socket.off('game:progress');
            socket.off('submission:complete');
            socket.disconnect();
            clearInterval(timer);
        };
    }, [matchId]);

    // Canvas Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Dark background with gradient
            const bgGradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            bgGradient.addColorStop(0, '#0f172a');
            bgGradient.addColorStop(1, '#020617');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Rope
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const ropeWidth = canvas.width * 0.7;
            const ropeHeight = 30;

            // Glow effect
            ctx.shadowBlur = 40;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';

            // Rope gradient
            const ropeGradient = ctx.createLinearGradient(
                centerX - ropeWidth / 2, centerY,
                centerX + ropeWidth / 2, centerY
            );
            ropeGradient.addColorStop(0, '#3b82f6');
            ropeGradient.addColorStop(0.5, '#ffffff');
            ropeGradient.addColorStop(1, '#ef4444');

            ctx.fillStyle = ropeGradient;
            ctx.beginPath();
            ctx.roundRect(centerX - ropeWidth / 2, centerY - ropeHeight / 2, ropeWidth, ropeHeight, 15);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Knot (position indicator)
            const maxOffset = ropeWidth / 2 - 60;
            const currentOffset = (gameState.position / 100) * maxOffset;
            const indicatorX = centerX + currentOffset;

            // Outer glow
            ctx.beginPath();
            ctx.arc(indicatorX, centerY, 55, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
            ctx.fill();

            // Inner knot
            ctx.beginPath();
            ctx.arc(indicatorX, centerY, 45, 0, Math.PI * 2);
            const knotGradient = ctx.createRadialGradient(
                indicatorX, centerY, 0,
                indicatorX, centerY, 45
            );
            knotGradient.addColorStop(0, '#fef3c7');
            knotGradient.addColorStop(1, '#f59e0b');
            ctx.fillStyle = knotGradient;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#fbbf24';
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Particles
            particleSystem.current.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1; // gravity
                p.life -= 0.015;
                p.vx *= 0.98;

                if (p.life > 0) {
                    ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    particleSystem.current.splice(i, 1);
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState.position]);

    const createParticles = (direction: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxOffset = (canvas.width * 0.7) / 2 - 60;
        const currentOffset = (gameState.position / 100) * maxOffset;
        const startX = centerX + currentOffset;

        for (let i = 0; i < 30; i++) {
            particleSystem.current.push({
                x: startX,
                y: centerY,
                vx: (Math.random() - 0.5) * 15 + (direction * 8),
                vy: (Math.random() - 0.5) * 15,
                life: 1.0,
                size: Math.random() * 6 + 3,
                color: direction > 0 ? '239, 68, 68' : '59, 130, 246', // red or blue
            });
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-dark-950 text-white">
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            <div className="relative z-10 flex flex-col h-full p-12">
                {/* Top Section - Team Scores */}
                <div className="flex justify-between items-start">
                    {/* Team A */}
                    <div className="text-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                            <h1 className="text-5xl font-black text-blue-400">{gameState.teamA.name}</h1>
                        </div>
                        <div className="text-8xl font-mono font-bold text-blue-300">
                            {Math.max(0, -gameState.position)}
                        </div>
                        <div className="text-dark-400 text-xl mt-2">points</div>
                    </div>

                    {/* Center Info */}
                    <div className="text-center">
                        <div className="card glass px-10 py-6 border-yellow-500/30 mb-4">
                            <div className="flex items-center gap-4 text-yellow-400 mb-4">
                                <Trophy className="w-10 h-10" />
                                <span className="text-4xl font-black">ROUND {gameState.round}</span>
                            </div>
                            <div className="text-7xl font-mono font-bold flex items-center justify-center gap-4">
                                <Timer className="w-12 h-12 text-dark-400" />
                                <span className={gameState.timeLeft < 60 ? 'text-red-400 animate-pulse' : ''}>
                                    {formatTime(gameState.timeLeft)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-dark-400">
                            <Users className="w-5 h-5" />
                            <span>Match ID: {matchId?.slice(0, 8)}...</span>
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="text-center">
                        <div className="flex items-center gap-3 mb-4 justify-end">
                            <h1 className="text-5xl font-black text-red-400">{gameState.teamB.name}</h1>
                            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                        </div>
                        <div className="text-8xl font-mono font-bold text-red-300">
                            {Math.max(0, gameState.position)}
                        </div>
                        <div className="text-dark-400 text-xl mt-2">points</div>
                    </div>
                </div>

                {/* Bottom - Live Feed */}
                <div className="mt-auto">
                    <div className="glass rounded-xl p-6 border-t border-white/10">
                        <h3 className="text-dark-400 font-medium mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            LIVE FEED
                        </h3>
                        <div className="space-y-2">
                            {events.length > 0 ? (
                                events.map((event, i) => (
                                    <div
                                        key={i}
                                        className={`text-lg ${event.includes('✅') ? 'text-green-400' : 'text-red-400'}`}
                                    >
                                        {event}
                                    </div>
                                ))
                            ) : (
                                <div className="text-dark-500 italic">Waiting for submissions...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
