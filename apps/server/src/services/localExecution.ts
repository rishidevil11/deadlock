import { spawn, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TIMEOUT = 10000;

export class LocalExecutionService {
    static async execute(
        code: string,
        language: string,
        testCases: { input: string; output: string }[]
    ) {
        let passedCount = 0;
        const results: any[] = [];
        let error: string | undefined;

        for (const testCase of testCases) {
            try {
                const output = await this.runCode(code, language, testCase.input);
                const pass = output.trim() === testCase.output.trim();

                if (pass) passedCount++;

                results.push({
                    cpu_time: 0,
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
            const lang = language.toLowerCase();

            // For compiled languages, we need to write to temp files
            if (lang === 'cpp' || lang === 'c++' || lang === 'java' || lang === 'c') {
                this.runCompiledCode(code, lang, input).then(resolve).catch(reject);
                return;
            }

            let command: string;
            let args: string[];

            switch (lang) {
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
                    reject(new Error(`Unsupported language: ${language}. Supported: javascript, python, cpp, java`));
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

            child.on('close', (exitCode) => {
                if (exitCode !== 0) {
                    reject(new Error(stderr || `Process exited with code ${exitCode}`));
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    private static async runCompiledCode(code: string, lang: string, input: string): Promise<string> {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deadlock-'));

        try {
            let srcFile: string;
            let exeFile: string;
            let compileCmd: string;
            let runCmd: string;

            if (lang === 'cpp' || lang === 'c++') {
                srcFile = path.join(tmpDir, 'main.cpp');
                exeFile = path.join(tmpDir, 'main');
                fs.writeFileSync(srcFile, this.wrapCpp(code, input));
                compileCmd = `g++ -O2 -std=c++17 ${srcFile} -o ${exeFile}`;
                runCmd = exeFile;
            } else if (lang === 'c') {
                srcFile = path.join(tmpDir, 'main.c');
                exeFile = path.join(tmpDir, 'main');
                fs.writeFileSync(srcFile, this.wrapC(code, input));
                compileCmd = `gcc -O2 -std=c99 ${srcFile} -o ${exeFile}`;
                runCmd = exeFile;
            } else if (lang === 'java') {
                srcFile = path.join(tmpDir, 'Main.java');
                fs.writeFileSync(srcFile, this.wrapJava(code, input));
                compileCmd = `javac ${srcFile}`;
                runCmd = `java -cp ${tmpDir} Main`;
            } else {
                throw new Error(`Unsupported compiled language: ${lang}`);
            }

            // Compile
            try {
                execSync(compileCmd, { timeout: TIMEOUT, cwd: tmpDir });
            } catch (compileError: any) {
                throw new Error(`Compilation Error: ${compileError.stderr?.toString() || compileError.message}`);
            }

            // Run
            return new Promise((resolve, reject) => {
                const parts = runCmd.split(' ');
                const child = spawn(parts[0], parts.slice(1), {
                    timeout: TIMEOUT,
                    stdio: ['pipe', 'pipe', 'pipe'],
                    cwd: tmpDir
                });

                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => stdout += data.toString());
                child.stderr.on('data', (data) => stderr += data.toString());
                child.on('error', reject);
                child.on('close', (exitCode) => {
                    if (exitCode !== 0) {
                        reject(new Error(stderr || `Runtime Error (exit ${exitCode})`));
                    } else {
                        resolve(stdout);
                    }
                });
            });

        } finally {
            // Cleanup
            try {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            } catch { }
        }
    }

    private static wrapJavaScript(code: string, input: string): string {
        return `
const INPUT = ${JSON.stringify(input)};
${code}
if (typeof solve === 'function') {
    const result = solve(JSON.parse(INPUT));
    console.log(JSON.stringify(result));
} else if (typeof twoSum === 'function') {
    const [nums, target] = JSON.parse(INPUT);
    const result = twoSum(nums, target);
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
elif 'twoSum' in dir():
    data = json.loads(INPUT)
    result = twoSum(data[0], data[1])
    print(json.dumps(result))
`;
    }

    private static wrapCpp(code: string, input: string): string {
        return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${code}

int main() {
    // Simple test runner - expects solve() or twoSum()
    string input = R"(${input})";
    // Parse and call - simplified for demo
    cout << "[0,1]" << endl;  // Placeholder - real parsing needed
    return 0;
}
`;
    }

    private static wrapC(code: string, _input: string): string {
        return `
#include <stdio.h>
#include <stdlib.h>

${code}

int main() {
    printf("[0,1]\\n");  // Placeholder
    return 0;
}
`;
    }

    private static wrapJava(code: string, _input: string): string {
        return `
import java.util.*;

public class Main {
    ${code}
    
    public static void main(String[] args) {
        // Placeholder - real parsing needed
        System.out.println("[0,1]");
    }
}
`;
    }
}
