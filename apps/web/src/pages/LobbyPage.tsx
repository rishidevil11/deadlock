import { useParams } from 'react-router-dom';
import { Users, Clock, Play } from 'lucide-react';

export function LobbyPage() {
    const { gameId } = useParams();

    const isDeadlock = gameId === 'deadlock';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                    {isDeadlock ? 'DeadLock' : 'Crack the Code'} <span className="text-gradient">Lobby</span>
                </h1>
                <p className="text-dark-400 text-lg">
                    Waiting for players to join...
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Teams List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-400" />
                        Teams
                    </h2>

                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="card p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${i < 2 ? 'bg-green-500' : 'bg-dark-600'}`} />
                                <div>
                                    <div className="font-medium">Team {i + 1}</div>
                                    <div className="text-sm text-dark-400">
                                        {i < 2 ? '3/3 players' : 'Waiting...'}
                                    </div>
                                </div>
                            </div>
                            {i < 2 && (
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                                    Ready
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Game Info */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4">Game Settings</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-dark-400">Mode</span>
                                <span>{isDeadlock ? 'Tug-of-War' : 'Reverse Engineering'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-400">Time Limit</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {isDeadlock ? '5 min/round' : '30 minutes'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-400">Teams</span>
                                <span>{isDeadlock ? '2' : '10'}</span>
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                        <Play className="w-5 h-5" />
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
}
