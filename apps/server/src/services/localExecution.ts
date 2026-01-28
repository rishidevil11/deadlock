import { spawn } from 'child_process';

const TIMEOUT = 10000;

export class LocalExecutionService {
    static async execute(
        code: string,
        language: string,
        testCases: { input: string; output: string }[]
    ) {
        const startTime = Date.now();
        let passedCount = 0;
        const results: any[] = [];
        let error: string | undefined;

        for (const testCase of testCases) {
            try {
                const output = await this.runCode(code, language, testCase.input);
                const pass = output.trim() === testCase.output.trim();

                if (pass) passedCount++;

                results.push({
                    cpu_time: 0, // Mock
                    real_time: 0,
                    memory: 0,
                    signal: 0,
                    exit_code: 0,
                    error: 0,
                    result: pass ? 0 : -1,
                    test_case: 'local',
                    output_md5: '',
                    output: output,
                });

            } catch (err) {
                error = err instanceof Error ? err.message : 'Execution error';
                results.push({
                    result: -1,
                    error: 1,
                    output: error
                });
                break;
            }
        }

        return {
            passed: passedCount === testCases.length && !error,
            results,
            error
        };
    }

    private static runCode(code: string, language: string, input: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let command: string;
            let args: string[];

            switch (language.toLowerCase()) {
                case 'javascript':
                case 'js':
                    command = 'node';
                    args = ['-e', this.wrapJavaScript(code, input)];
                    break;
                case 'python':
                case 'py':
                    command = 'python3';
                    args = ['-c', this.wrapPython(code, input)];
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

    private static wrapJavaScript(code: string, input: string): string {
        return `
    const INPUT = ${JSON.stringify(input)};
    ${code}
    if (typeof solve === 'function') {
      const result = solve(JSON.parse(INPUT));
      console.log(JSON.stringify(result));
    }
    `;
    }

    private static wrapPython(code: string, input: string): string {
        return `
import json
INPUT = ${JSON.stringify(input)}
${code}
if 'solve' in dir():
    result = solve(json.loads(INPUT))
    print(json.dumps(result))
    `;
    }
}
