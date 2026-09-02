import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        let contractType = (body.contractType || body.filename || '').trim();

        // Strip .compact or path prefixes
        if (contractType.endsWith('.compact')) {
            contractType = contractType.replace(/\.compact$/, '');
        }
        contractType = path.basename(contractType);

        const runAll = Boolean(body.all);
        let targetTestFile = '';

        if (!runAll && contractType) {
            const specificPath = path.resolve(process.cwd(), 'tests', 'contracts', `${contractType}.test.ts`);
            try {
                await fs.access(specificPath);
                targetTestFile = `tests/contracts/${contractType}.test.ts`;
            } catch {
                return NextResponse.json({
                    success: true,
                    data: {
                        testAvailable: false,
                        isAllTests: false,
                        contractType,
                        targetTestFile: `tests/contracts/${contractType}.test.ts`,
                        message: `No test suite found for ${contractType}.test.ts. You can generate a comprehensive test suite using the AI Copilot.`,
                        totalTests: 0,
                        passedTests: 0,
                        failedTests: 0,
                        totalDurationMs: 0,
                        suites: [],
                        timestamp: new Date().toISOString(),
                    },
                });
            }
        } else {
            targetTestFile = 'tests/';
        }

        const vitestCmd = `npx vitest run --reporter=json ${targetTestFile}`;
        let rawStdout = '';
        let rawStderr = '';

        try {
            const { stdout, stderr } = await execAsync(vitestCmd, {
                cwd: process.cwd(),
                timeout: 30000,
                maxBuffer: 10 * 1024 * 1024,
            });
            rawStdout = stdout;
            rawStderr = stderr;
        } catch (execError: any) {
            // Vitest exits with non-zero if tests fail, but still outputs valid JSON to stdout
            rawStdout = execError.stdout || '';
            rawStderr = execError.stderr || '';
        }

        // Extract JSON object from stdout (since sourcemap warnings might precede it)
        const jsonMatch = rawStdout.match(/\{[\s\S]*"testResults"[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to parse Vitest test runner output.',
                    rawOutput: rawStdout + '\n' + rawStderr,
                },
                { status: 500 }
            );
        }

        const parsedJson = JSON.parse(jsonMatch[0]);

        const suites = (parsedJson.testResults || []).map((fileResult: any) => {
            const relativeName = path.relative(process.cwd(), fileResult.name);
            let tests = (fileResult.assertionResults || []).map((assertion: any) => ({
                title: assertion.title,
                fullName: assertion.fullName,
                suite: (assertion.ancestorTitles || []).join(' > ') || path.basename(relativeName),
                status: assertion.status, // 'passed' | 'failed'
                durationMs: Math.round((assertion.duration || 0) * 10) / 10,
                failureMessages: assertion.failureMessages || [],
            }));

            // If suite failed before any tests could run (e.g. import or compile error)
            if (fileResult.status === 'failed' && tests.length === 0 && fileResult.message) {
                tests = [
                    {
                        title: 'Test Suite Execution / Import Error',
                        fullName: `${relativeName} > Test Suite Execution / Import Error`,
                        suite: path.basename(relativeName),
                        status: 'failed',
                        durationMs: 0,
                        failureMessages: [fileResult.message],
                    },
                ];
            }

            return {
                name: relativeName,
                status: fileResult.status,
                durationMs:
                    fileResult.endTime && fileResult.startTime
                        ? Math.round(fileResult.endTime - fileResult.startTime)
                        : 0,
                tests,
            };
        });

        const suitesFailed = suites.filter(
            (s: any) => s.status === 'failed' && s.tests.some((t: any) => t.status === 'failed')
        ).length;
        const totalTests =
            parsedJson.numTotalTests || suites.reduce((acc: number, s: any) => acc + s.tests.length, 0);
        const passedTests = parsedJson.numPassedTests || 0;
        const failedTests =
            (parsedJson.numFailedTests || 0) +
            (parsedJson.numTotalTests === 0 && suitesFailed > 0 ? suitesFailed : 0);
        const totalDurationMs = suites.reduce((acc: number, s: any) => acc + s.durationMs, 0);

        return NextResponse.json({
            success: true,
            data: {
                testAvailable: true,
                isAllTests: runAll,
                contractType,
                totalTests,
                passedTests,
                failedTests,
                totalDurationMs,
                suites,
                targetTestFile,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error('Error executing circuit tests:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Internal test runner execution error',
            },
            { status: 500 }
        );
    }
}
