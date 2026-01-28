import { spawn } from 'child_process';

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

const TIMEOUT = parseInt(process.env.CODE_EXECUTION_TIMEOUT || '10000');

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
    const startTime = Date.now();
    let passedCount = 0;
    let error: string | undefined;

    for (const testCase of testCases) {
        try {
            const result = await runCode(code, language, testCase.input);

            if (result.trim() === testCase.expected.trim()) {
                passedCount++;
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'Execution error';
            break;
        }
    }

    const runtime = Date.now() - startTime;

    return {
        passed: passedCount === testCases.length && !error,
        passedCount,
        totalCount: testCases.length,
        runtime,
        error,
    };
}

async function runCode(code: string, language: string, input: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let command: string;
        let args: string[];

        switch (language.toLowerCase()) {
            case 'javascript':
            case 'js':
                command = 'node';
                args = ['-e', wrapJavaScript(code, input)];
                break;
            case 'python':
            case 'py':
                command = 'python3';
                args = ['-c', wrapPython(code, input)];
                break;
            default:
                reject(new Error(`Unsupported language: ${language}`));
                return;
        }

        const child = spawn(command, args, {
            timeout: TIMEOUT,
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('error', (err) => {
            reject(err);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(stderr || `Process exited with code ${code}`));
            } else {
                resolve(stdout);
            }
        });
    });
}

function wrapJavaScript(code: string, input: string): string {
    return `
    const INPUT = ${JSON.stringify(input)};
    ${code}
    if (typeof solve === 'function') {
      const result = solve(JSON.parse(INPUT));
      console.log(JSON.stringify(result));
    }
  `;
}

function wrapPython(code: string, input: string): string {
    return `
import json
INPUT = ${JSON.stringify(input)}
${code}
if 'solve' in dir():
    result = solve(json.loads(INPUT))
    print(json.dumps(result))
  `;
}
