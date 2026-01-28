import { JudgeService } from './judgeServer.js';

interface TestCase {
    input: string;
    expected: string;
    isPublic?: boolean;
}

interface ExecutionResult {
    passed: boolean;
    passedCount: number;
    totalCount: number;
    runtime: number;
    memory?: number;
    error?: string;
}

/**
 * Execute code against test cases
 * NOTE: This is a simplified implementation. For production, use Docker containers
 * or a sandboxed environment like Firecracker for security.
 */
export async function executeCode(
    code: string,
    language: string,
    testCases: TestCase[]
): Promise<ExecutionResult> {
    try {
        const { passed, results, error } = await JudgeService.submit(
            code,
            language,
            testCases.map(tc => ({ input: tc.input, output: tc.expected }))
        );

        // Calculate total runtime from passed tests
        const totalRuntime = results.reduce((acc, r) => acc + (r.cpu_time || 0), 0);
        const passedCount = results.filter(r => r.result === 0).length;

        return {
            passed,
            passedCount,
            totalCount: testCases.length,
            runtime: totalRuntime,
            error,
        };
    } catch (err) {
        return {
            passed: false,
            passedCount: 0,
            totalCount: testCases.length,
            runtime: 0,
            error: err instanceof Error ? err.message : 'Execution failed',
        };
    }
}


