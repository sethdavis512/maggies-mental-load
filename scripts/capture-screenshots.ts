import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { createScreenshotRun } from './screenshot-run';

const PROJECT_ROOT = process.cwd();

function runPlaywrightCapture(env: NodeJS.ProcessEnv): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(
            'bunx',
            [
                'playwright',
                'test',
                '--project=chromium',
                '--reporter=line',
                'tests/screenshots.spec.ts',
            ],
            {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    ...env,
                },
            },
        );

        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(
                new Error(
                    `Screenshot capture failed with exit code ${code ?? 'unknown'}`,
                ),
            );
        });
        child.on('error', (error) => reject(error));
    });
}

async function main() {
    const run = await createScreenshotRun(PROJECT_ROOT);

    console.log(`\n📸 Screenshot run: ${run.runDate}/${run.runId}`);
    console.log(`📁 Output directory: ${run.relativeRunPath}\n`);

    await runPlaywrightCapture({
        SCREENSHOT_OUTPUT_DIR: run.runPath,
        SCREENSHOT_RELATIVE_RUN_DIR: run.relativeRunPath,
    });

    const metadata = {
        runDate: run.runDate,
        runId: run.runId,
        relativeRunPath: run.relativeRunPath.split(path.sep).join('/'),
    };
    console.log(`\nRUN_METADATA=${JSON.stringify(metadata)}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
