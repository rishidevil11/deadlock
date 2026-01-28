import { Link } from 'react-router-dom';
import { Zap, Users, Trophy } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="glass border-b border-dark-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gradient">DeadLock</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
                        >
                            <Trophy className="w-4 h-4" />
                            <span>Games</span>
                        </Link>
                        <Link
                            to="/teams"
                            className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            <span>Teams</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
