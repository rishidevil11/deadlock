import { useState } from 'react';
import { Clock, Send, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';

export function CrackTheCodePage() {
    const [input, setInput] = useState('');
    const [attempts, setAttempts] = useState<{ input: string; output: string; }[]>([
        { input: '5', output: '25' },
        { input: '3', output: '9' },
        { input: '-2', output: '4' },
    ]);
    const [guess, setGuess] = useState('');

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Game Header */}
            <div className="glass border-b border-dark-700/50 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-accent-400" />
                        <span className="font-bold text-lg">Crack the Code</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">24:15</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-dark-400">Attempts: {attempts.length}/50</span>
                    <span className="px-3 py-1 bg-accent-500/20 text-accent-400 rounded-full text-sm">
                        Challenge #1
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Input/Output Panel */}
                <div className="w-1/2 border-r border-dark-700 flex flex-col">
                    <div className="p-6 border-b border-dark-700">
                        <h2 className="text-xl font-bold mb-2">Mystery Function</h2>
                        <p className="text-dark-400">
                            Discover what the hidden function does by testing different inputs.
                        </p>
                    </div>

                    {/* Test Input */}
                    <div className="p-6 border-b border-dark-700">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter test input..."
                                className="input flex-1"
                            />
                            <button
                                onClick={() => {
                                    if (input) {
                                        setAttempts([...attempts, { input, output: String(Number(input) ** 2) }]);
                                        setInput('');
                                    }
                                }}
                                className="btn-accent px-6"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Results Log */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="text-sm font-medium text-dark-400 mb-4">Test Results</h3>
                        <div className="space-y-2">
                            {attempts.map((attempt, i) => (
                                <div key={i} className="bg-dark-900 rounded-lg p-3 flex items-center justify-between font-mono text-sm">
                                    <span className="text-dark-400">f({attempt.input})</span>
                                    <span className="text-primary-400">→ {attempt.output}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Solution Panel */}
                <div className="w-1/2 flex flex-col">
                    <div className="p-6 border-b border-dark-700">
                        <h2 className="text-xl font-bold mb-2">Submit Your Solution</h2>
                        <p className="text-dark-400">
                            Write the function that produces these outputs.
                        </p>
                    </div>

                    <div className="flex-1 p-6">
                        <textarea
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="function mystery(x) {&#10;  // Your solution here&#10;}"
                            className="w-full h-64 bg-dark-900 p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-500"
                            spellCheck={false}
                        />

                        <div className="mt-6 flex gap-3">
                            <button className="btn-secondary flex-1">
                                <span className="flex items-center justify-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Test
                                </span>
                            </button>
                            <button className="btn-accent flex-1">
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Submit Solution
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Leaderboard Preview */}
                    <div className="border-t border-dark-700 p-6">
                        <h3 className="text-sm font-medium text-dark-400 mb-3">Leaderboard</h3>
                        <div className="space-y-2">
                            {['Team Alpha', 'Team Beta', 'Team Gamma'].map((team, i) => (
                                <div key={team} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'
                                            }`}>
                                            {i + 1}
                                        </span>
                                        {team}
                                    </span>
                                    <span className="text-dark-400">{3 - i} solved</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
