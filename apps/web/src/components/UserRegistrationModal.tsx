import { useState } from 'react';
import { User } from 'lucide-react';

interface UserRegistrationProps {
    onRegister: (user: any) => void;
}

export function UserRegistrationModal({ onRegister }: UserRegistrationProps) {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);
        try {
            // Simple registration/login logic
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="card max-w-md w-full p-8 mx-4 border-primary-500/30 shadow-2xl shadow-primary-500/10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/25">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Welcome, Hacker</h2>
                    <p className="text-dark-300">Enter your ident to access the system.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>
        </div>
    );
}
