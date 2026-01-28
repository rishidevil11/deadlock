import { useState } from 'react';
import { Clock, Trophy, Zap } from 'lucide-react';

export function DeadLockPage() {
    const [code, setCode] = useState('// Write your solution here\n\nfunction solve(input) {\n  \n}');

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Game Header */}
            <div className="glass border-b border-dark-700/50 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary-400" />
                        <span className="font-bold text-lg">DeadLock</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">04:32</span>
                    </div>
                </div>

                {/* Tug of War Indicator */}
                <div className="flex items-center gap-4">
                    <span className="text-blue-400 font-medium">Team Alpha</span>
                    <div className="w-64 h-3 bg-dark-700 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500" />
                        <div className="absolute inset-y-0 left-1/2 w-1 bg-white -translate-x-1/2" />
                    </div>
                    <span className="text-red-400 font-medium">Team Beta</span>
                </div>

                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Round 3/5</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Problem Panel */}
                <div className="w-[400px] border-r border-dark-700 overflow-y-auto p-6">
                    <div className="mb-4">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">
                            Medium
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Two Sum</h2>
                    <div className="prose prose-invert prose-sm">
                        <p className="text-dark-300">
                            Given an array of integers <code>nums</code> and an integer <code>target</code>,
                            return indices of the two numbers such that they add up to <code>target</code>.
                        </p>
                        <p className="text-dark-300">
                            You may assume that each input would have exactly one solution,
                            and you may not use the same element twice.
                        </p>

                        <h3 className="text-white mt-6 mb-3">Example:</h3>
                        <pre className="bg-dark-900 p-4 rounded-lg text-sm">
                            <code>
                                {`Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9`}
                            </code>
                        </pre>
                    </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 bg-dark-900 p-4">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full bg-transparent font-mono text-sm text-dark-100 resize-none focus:outline-none"
                            spellCheck={false}
                        />
                    </div>

                    {/* Editor Footer */}
                    <div className="glass border-t border-dark-700/50 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <select className="input py-2 w-40">
                                <option>JavaScript</option>
                                <option>Python</option>
                                <option>Java</option>
                                <option>C++</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="btn-secondary">Run Code</button>
                            <button className="btn-primary">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
