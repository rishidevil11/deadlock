import { useState } from 'react';
import { User, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserRegistrationProps {
    onRegister: (user: any) => void;
}

export function UserRegistrationModal({ onRegister }: UserRegistrationProps) {
    const [mode, setMode] = useState<'contestant' | 'admin'>('contestant');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleContestantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);
        try {
            // Check if it's a simple registration attempt
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password: 'password123' // Default password for simplified local play
                }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onRegister(data.user);
            } else {
                // Try login if register fail (user exists)
                const loginRes = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password: 'password123' }),
                });
                const loginData = await loginRes.json();

                if (loginRes.ok) {
                    localStorage.setItem('token', loginData.token);
                    localStorage.setItem('user', JSON.stringify(loginData.user));
                    onRegister(loginData.user);
                } else {
                    alert('Error: ' + (data.error || 'Failed to register'));
                }
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'CELESTIUS') {
            // Create a pseudo-admin user session
            const adminUser = {
                id: 'admin-key',
                username: 'Administrator',
                isAdmin: true
            };
            localStorage.setItem('user', JSON.stringify(adminUser));
            // Trigger register to close modal (if used in Layout)
            onRegister(adminUser);
            // Navigate to admin dashboard
            navigate('/admin/dashboard');
        } else {
            alert('Access Denied: Invalid Security Code');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="card max-w-md w-full p-8 mx-4 border-primary-500/30 shadow-2xl shadow-primary-500/10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/25">
                        {mode === 'contestant' ? (
                            <User className="w-8 h-8 text-white" />
                        ) : (
                            <Shield className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                        {mode === 'contestant' ? 'Join the Battle' : 'Admin Control'}
                    </h2>
                    <p className="text-dark-300">
                        {mode === 'contestant'
                            ? 'Enter your ident to access the system.'
                            : 'Enter security clearance code.'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-dark-800 rounded-lg mb-6">
                    <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'contestant'
                                ? 'bg-dark-700 text-white shadow'
                                : 'text-dark-400 hover:text-white'
                            }`}
                        onClick={() => setMode('contestant')}
                    >
                        Contestant
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'admin'
                                ? 'bg-dark-700 text-white shadow'
                                : 'text-dark-400 hover:text-white'
                            }`}
                        onClick={() => setMode('admin')}
                    >
                        Admin
                    </button>
                </div>

                {mode === 'contestant' ? (
                    <form onSubmit={handleContestantSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Username"
                                className="input w-full text-center text-lg py-3"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !username.trim()}
                            className="btn-primary w-full py-4 text-lg"
                        >
                            {isLoading ? 'Authenticating...' : 'Enter System'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAdminSubmit} className="space-y-6">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Security Code"
                                className="input w-full pl-10 py-3"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!password.trim()}
                            className="btn-primary w-full py-4 text-lg bg-red-600 hover:bg-red-700 border-red-500"
                        >
                            Access Dashboard
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
