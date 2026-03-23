import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ADJECTIVES = [
    'rare',
    'calm',
    'brisk',
    'bright',
    'gentle',
    'nimble',
    'steady',
    'swift',
    'cozy',
    'lively',
    'bold',
    'tidy',
];

const ANIMALS = [
    'geckos',
    'otters',
    'robins',
    'falcons',
    'badgers',
    'foxes',
    'beavers',
    'sparrows',
    'tigers',
    'hedgehogs',
    'pandas',
    'wombats',
];

const NOUNS = [
    'jam',
    'spark',
    'stride',
    'pulse',
    'wave',
    'glow',
    'orbit',
    'flow',
    'burst',
    'trail',
    'thread',
    'signal',
];

type HumanIdOptions = {
    separator?: string;
    capitalize?: boolean;
};

function randomItem(values: readonly string[]): string {
    return values[Math.floor(Math.random() * values.length)] ?? 'id';
}

export function humanId(options: HumanIdOptions = {}): string {
    const separator = options.separator ?? '-';
    const capitalize = options.capitalize ?? false;
    const words = [
        randomItem(ADJECTIVES),
        randomItem(ANIMALS),
        randomItem(NOUNS),
    ];

    if (capitalize) {
        return words
            .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
            .join(separator);
    }

    return words.join(separator);
}

export type ScreenshotRun = {
    runDate: string;
    runId: string;
    runPath: string;
    relativeRunPath: string;
};

export async function createScreenshotRun(
    projectRoot: string,
): Promise<ScreenshotRun> {
    const runDate = new Date().toISOString().slice(0, 10);
    const dayPath = path.join(projectRoot, 'screenshots', 'runs', runDate);
    await mkdir(dayPath, { recursive: true });

    for (;;) {
        const runId = humanId({
            separator: '-',
            capitalize: false,
        });
        const relativeRunPath = path.join(
            'screenshots',
            'runs',
            runDate,
            runId,
        );
        const runPath = path.join(projectRoot, relativeRunPath);

        try {
            await mkdir(runPath);
            return {
                runDate,
                runId,
                runPath,
                relativeRunPath,
            };
        } catch (error) {
            const maybeNodeError = error as NodeJS.ErrnoException;
            if (maybeNodeError.code === 'EEXIST') {
                continue;
            }
            throw error;
        }
    }

    throw new Error('Unable to allocate screenshot run directory.');
}
