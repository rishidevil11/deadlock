import { Link } from 'react-router-dom';
import { Swords, Code2, Users, Clock, ChevronRight } from 'lucide-react';

export function HomePage() {
    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-950/50 via-dark-950 to-accent-950/30" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
                        <span className="text-gradient">Code.</span>{' '}
                        <span className="text-white">Compete.</span>{' '}
                        <span className="text-gradient">Conquer.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-dark-300 max-w-3xl mx-auto mb-12">
                        Battle it out in intense coding challenges. Work with your team to solve problems
                        faster than your opponents.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2 group">
                            Join Game
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="btn-secondary text-lg px-8 py-3">
                            View Leaderboard
                        </button>
                    </div>
                </div>
            </section>

            {/* Games Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Choose Your <span className="text-gradient">Battle</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* DeadLock Card */}
                        <Link
                            to="/lobby/deadlock"
                            className="card p-8 group hover:border-primary-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/25">
                                    <Swords className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">DeadLock</h3>
                                    <p className="text-dark-400">Tug-of-War Coding Battle</p>
                                </div>
                            </div>

                            <p className="text-dark-300 mb-6">
                                Two teams battle head-to-head. Solve problems to pull the rope towards your side.
                                First team to pull it all the way wins!
                            </p>

                            <div className="flex items-center gap-6 text-sm text-dark-400">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>Team vs Team</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>5 min rounds</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center text-primary-400 font-medium group-hover:text-primary-300">
                                Enter Arena
                                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Crack The Code Card */}
                        <Link
                            to="/lobby/crack-the-code"
                            className="card p-8 group hover:border-accent-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent-500/10"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-accent-500 to-purple-600 shadow-lg shadow-accent-500/25">
                                    <Code2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Crack the Code</h3>
                                    <p className="text-dark-400">Reverse Engineering Challenge</p>
                                </div>
                            </div>

                            <p className="text-dark-300 mb-6">
                                Analyze outputs, discover patterns, and reverse-engineer the hidden function.
                                Race against other teams to crack it first!
                            </p>

                            <div className="flex items-center gap-6 text-sm text-dark-400">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>10 Teams</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>30 min limit</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center text-accent-400 font-medium group-hover:text-accent-300">
                                Start Challenge
                                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-t border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '10', label: 'Teams' },
                            { value: '30', label: 'Players' },
                            { value: '2', label: 'Games' },
                            { value: '∞', label: 'Possibilities' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                                <div className="text-dark-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
