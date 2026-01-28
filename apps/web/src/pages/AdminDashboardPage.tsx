import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, ArrowRight, RefreshCw, Play, Settings, UserPlus, X } from 'lucide-react';

interface User {
    id: string;
    username: string;
    teamId: string | null;
}

interface Team {
    id: string;
    name: string;
    score: number;
    members: { id: string; username: string }[];
}

export function AdminDashboardPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [draggedUser, setDraggedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsRes, usersRes] = await Promise.all([
                fetch('/api/teams'),
                fetch('/api/admin/users')
            ]);

            const teamsData = await teamsRes.json();
            setTeams(teamsData);

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    };

    const createTeam = async () => {
        if (!newTeamName.trim()) return;

        try {
            const res = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTeamName.trim() })
            });

            if (res.ok) {
                setNewTeamName('');
                fetchData();
            }
        } catch (err) {
            console.error('Failed to create team:', err);
        }
    };

    const deleteTeam = async (teamId: string) => {
        if (!confirm('Delete this team? Members will become unassigned.')) return;

        try {
            await fetch(`/api/admin/teams/${teamId}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Failed to delete team:', err);
        }
    };

    const moveUserToTeam = async (userId: string, teamId: string | null) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/team`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId })
            });

            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error('Failed to move user:', err);
        }
    };

    const handleDrop = (teamId: string | null) => {
        if (draggedUser) {
            moveUserToTeam(draggedUser.id, teamId);
            setDraggedUser(null);
        }
    };

    const startMatch = async (teamAId: string, teamBId: string) => {
        try {
            const res = await fetch('/api/games/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameType: 'deadlock',
                    teamAId,
                    teamBId
                })
            });

            if (res.ok) {
                const match = await res.json();
                // Open admin projector in new tab
                window.open(`/admin/projector/${match.id}`, '_blank');
            }
        } catch (err) {
            console.error('Failed to start match:', err);
        }
    };

    const unassignedUsers = users.filter(u => !u.teamId);

    return (
        <div className="min-h-screen bg-dark-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Settings className="w-8 h-8 text-primary-400" />
                            Admin Dashboard
                        </h1>
                        <p className="text-dark-400 mt-1">Manage teams and organize matches</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Create Team */}
                <div className="card p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-green-400" />
                        Create New Team
                    </h2>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="Enter team name (e.g., Team Gamma)"
                            className="input flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && createTeam()}
                        />
                        <button onClick={createTeam} className="btn-primary px-6">
                            Create Team
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Teams Grid */}
                    <div className="lg:col-span-3">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-400" />
                            Teams ({teams.length})
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {teams.map((team, index) => (
                                <div
                                    key={team.id}
                                    className={`card p-5 transition-all ${draggedUser ? 'border-dashed border-2 border-primary-500/50' : ''
                                        }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(team.id)}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${index % 2 === 0 ? 'bg-blue-500' : 'bg-red-500'
                                                }`} />
                                            <h3 className="font-bold text-lg">{team.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => deleteTeam(team.id)}
                                            className="text-dark-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-2 mb-4 min-h-[80px]">
                                        {team.members.length > 0 ? (
                                            team.members.map(member => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between bg-dark-800 px-3 py-2 rounded-lg cursor-move"
                                                    draggable
                                                    onDragStart={() => setDraggedUser({ ...member, teamId: team.id })}
                                                    onDragEnd={() => setDraggedUser(null)}
                                                >
                                                    <span className="text-sm">{member.username}</span>
                                                    <button
                                                        onClick={() => moveUserToTeam(member.id, null)}
                                                        className="text-dark-500 hover:text-red-400"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-dark-500 text-sm italic text-center py-4">
                                                Drop players here
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-dark-400">
                                        <span>{team.members.length} members</span>
                                        <span className="text-yellow-400">Score: {team.score}</span>
                                    </div>
                                </div>
                            ))}

                            {teams.length === 0 && (
                                <div className="col-span-full text-center py-12 text-dark-500">
                                    No teams created yet. Create one above!
                                </div>
                            )}
                        </div>

                        {/* Quick Match Buttons */}
                        {teams.length >= 2 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Play className="w-5 h-5 text-green-400" />
                                    Start Matches
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: Math.floor(teams.length / 2) }).map((_, i) => {
                                        const teamA = teams[i * 2];
                                        const teamB = teams[i * 2 + 1];
                                        if (!teamA || !teamB) return null;

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => startMatch(teamA.id, teamB.id)}
                                                className="card p-4 flex items-center justify-between hover:border-green-500/50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-blue-400 font-bold">{teamA.name}</span>
                                                    <span className="text-dark-500">vs</span>
                                                    <span className="text-red-400 font-bold">{teamB.name}</span>
                                                </div>
                                                <Play className="w-5 h-5 text-dark-500 group-hover:text-green-400 transition-colors" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Unassigned Players */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-yellow-400" />
                            Unassigned ({unassignedUsers.length})
                        </h2>

                        <div
                            className={`card p-4 min-h-[200px] ${draggedUser ? 'border-dashed border-2 border-yellow-500/50' : ''
                                }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(null)}
                        >
                            {unassignedUsers.length > 0 ? (
                                <div className="space-y-2">
                                    {unassignedUsers.map(user => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between bg-dark-800 px-3 py-2 rounded-lg cursor-move"
                                            draggable
                                            onDragStart={() => setDraggedUser(user)}
                                            onDragEnd={() => setDraggedUser(null)}
                                        >
                                            <span className="text-sm">{user.username}</span>
                                            <ArrowRight className="w-4 h-4 text-dark-500" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-dark-500 text-sm italic text-center py-8">
                                    All players are assigned to teams
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-dark-500 mt-2">
                            Drag players to move them between teams
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
