import path from 'node:path';
import { test, expect } from './fixtures';

type ScreenTarget = {
    name: string;
    route: string;
    waitFor?: { role: 'heading' | 'button'; name: string };
};

const SCREEN_TARGETS: ScreenTarget[] = [
    {
        name: 'home',
        route: '/',
        waitFor: { role: 'heading', name: 'Your household command center' },
    },
    {
        name: 'profile',
        route: '/profile',
        waitFor: { role: 'heading', name: 'Profile' },
    },
    {
        name: 'chat',
        route: '/chat',
        waitFor: { role: 'heading', name: 'Plan with Maggie' },
    },
    {
        name: 'notes',
        route: '/notes',
        waitFor: { role: 'heading', name: 'Saved notes' },
    },
    {
        name: 'form',
        route: '/form',
        waitFor: { role: 'heading', name: 'Form' },
    },
];

const OUTPUT_DIR_ENV = 'SCREENSHOT_OUTPUT_DIR';
const RELATIVE_RUN_ENV = 'SCREENSHOT_RELATIVE_RUN_DIR';
const DEFAULT_DIR = path.join(process.cwd(), 'screenshots');

test.describe('screenshot capture', () => {
    for (const target of SCREEN_TARGETS) {
        test(`captures ${target.name}`, async ({ authedPage }) => {
            const outputDir = process.env[OUTPUT_DIR_ENV] ?? DEFAULT_DIR;
            const relativeRunDir =
                process.env[RELATIVE_RUN_ENV] ?? 'screenshots';
            const targetFile = path.join(outputDir, `${target.name}.png`);

            await authedPage.goto(target.route);

            if (target.waitFor) {
                await expect(
                    authedPage.getByRole(target.waitFor.role, {
                        name: target.waitFor.name,
                    }),
                ).toBeVisible();
            }

            await authedPage.setViewportSize({ width: 1440, height: 900 });
            await authedPage.screenshot({
                path: targetFile,
                fullPage: true,
            });

            test.info().annotations.push({
                type: 'screenshot',
                description: path.join(relativeRunDir, `${target.name}.png`),
            });
        });
    }
});
