import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, Play, Loader2, UserPlus, Check } from 'lucide-react';

interface TeamMember {
    id: string;
    username: string;
}

interface Team {
    id: string;
    name: string;
    score: number;
    members: TeamMember[];
}

export function LobbyPage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const isDeadlock = gameId === 'deadlock';

    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await fetch('/api/teams');
            const data = await res.json();
            setTeams(data);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinTeam = async (teamId: string) => {
        if (!currentUser.id) {
            alert('Please register first!');
            return;
        }

        setJoiningTeamId(teamId);
        try {
            const res = await fetch(`/api/teams/${teamId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                localStorage.setItem('user', JSON.stringify(updatedUser));
                await fetchTeams();
            } else {
                const err = await res.json();
                alert('Failed to join team: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error joining team:', error);
            alert('Network error joining team');
        } finally {
            setJoiningTeamId(null);
        }
    };

    const handleStartGame = async () => {
        if (teams.length < 2 && isDeadlock) {
            alert('Need at least 2 teams for DeadLock!');
            return;
        }

        setIsStarting(true);
        try {
            const payload = {
                gameType: isDeadlock ? 'deadlock' : 'crack-the-code',
                teamAId: teams[0]?.id,
                teamBId: teams[1]?.id
            };

            const res = await fetch('/api/games/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to create match');

            const match = await res.json();
            navigate(`/deadlock/${match.id}`);
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Failed to start game');
        } finally {
            setIsStarting(false);
        }
    };

    const isUserInTeam = (team: Team) => {
        return team.members.some(m => m.id === currentUser.id);
    };

    const getUserTeam = () => {
        return teams.find(t => isUserInTeam(t));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const userTeam = getUserTeam();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                    {isDeadlock ? 'DeadLock' : 'Crack the Code'} <span className="text-gradient">Lobby</span>
                </h1>
                <p className="text-dark-400 text-lg">
                    {userTeam ? (
                        <>You are on <span className="text-primary-400 font-bold">{userTeam.name}</span></>
                    ) : (
                        'Join a team to start competing!'
                    )}
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Teams List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-400" />
                        Teams ({teams.length})
                    </h2>

                    {teams.map((team) => {
                        const isMember = isUserInTeam(team);
                        const isJoining = joiningTeamId === team.id;

                        return (
                            <div
                                key={team.id}
                                className={`card p-5 flex items-center justify-between transition-all ${isMember ? 'border-primary-500/50 bg-primary-500/5' : 'hover:border-dark-600'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-4 h-4 rounded-full ${team.members.length >= 1 ? 'bg-green-500' : 'bg-dark-600'
                                        }`} />
                                    <div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {team.name}
                                            {isMember && (
                                                <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                                                    YOUR TEAM
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-dark-400 flex items-center gap-2 mt-1">
                                            {team.members.length > 0 ? (
                                                <span className="flex items-center gap-1">
                                                    {team.members.map((m, i) => (
                                                        <span key={m.id} className="text-dark-300">
                                                            {m.username}{i < team.members.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                </span>
                                            ) : (
                                                <span className="italic">No members yet</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isMember ? (
                                        <span className="flex items-center gap-2 text-green-400">
                                            <Check className="w-5 h-5" />
                                            Joined
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinTeam(team.id)}
                                            disabled={isJoining || !!userTeam}
                                            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isJoining ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="w-4 h-4" />
                                            )}
                                            {userTeam ? 'Already in Team' : 'Join Team'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {teams.length === 0 && (
                        <div className="card p-8 text-center text-dark-400">
                            No teams found. Run <code className="bg-dark-800 px-2 py-1 rounded">npm run db:seed</code> to create teams.
                        </div>
                    )}
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
                                <span className="text-dark-400">Teams Ready</span>
                                <span className="text-green-400">{teams.filter(t => t.members.length > 0).length}/{teams.length}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleStartGame}
                        disabled={isStarting || !userTeam || teams.length < 2}
                        className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                        {!userTeam ? 'Join a Team First' : 'Start Game'}
                    </button>

                    {userTeam && (
                        <p className="text-center text-sm text-dark-400">
                            Share this link with the other team: <br />
                            <code className="text-primary-400 bg-dark-800 px-2 py-1 rounded text-xs">
                                {window.location.href}
                            </code>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
