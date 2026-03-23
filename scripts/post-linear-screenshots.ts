import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const LINEAR_API_URL = 'https://api.linear.app/graphql';

type RunContext = {
    runDate: string;
    runId: string;
    relativeRunPath: string;
    absoluteRunPath: string;
};

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function resolveRepoSlug(): string {
    const fromEnv = process.env.GITHUB_REPOSITORY;
    if (fromEnv) return fromEnv;

    const owner = process.env.SCREENSHOT_GITHUB_OWNER;
    const repo = process.env.SCREENSHOT_GITHUB_REPO;
    if (owner && repo) return `${owner}/${repo}`;

    throw new Error(
        'Missing GitHub repo context. Set GITHUB_REPOSITORY or SCREENSHOT_GITHUB_OWNER + SCREENSHOT_GITHUB_REPO.',
    );
}

function normalizePathForUrl(value: string): string {
    return value.split(path.sep).join('/');
}

async function resolveLatestRun(projectRoot: string): Promise<RunContext> {
    const runsRoot = path.join(projectRoot, 'screenshots', 'runs');
    const dateEntries = (await readdir(runsRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();

    const runDate = dateEntries.at(-1);
    if (!runDate) {
        throw new Error(
            'No screenshot date folders found in screenshots/runs.',
        );
    }

    const dayFolder = path.join(runsRoot, runDate);
    const runEntries = (await readdir(dayFolder, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    const runId = runEntries.at(-1);
    if (!runId) {
        throw new Error(
            `No screenshot runs found under screenshots/runs/${runDate}.`,
        );
    }

    const relativeRunPath = path.join('screenshots', 'runs', runDate, runId);
    return {
        runDate,
        runId,
        relativeRunPath,
        absoluteRunPath: path.join(projectRoot, relativeRunPath),
    };
}

function resolveRunFromEnv(projectRoot: string): RunContext | null {
    const runDate = process.env.SCREENSHOT_RUN_DATE;
    const runId = process.env.SCREENSHOT_RUN_ID;
    const relativeRunPath = process.env.SCREENSHOT_RELATIVE_RUN_DIR;

    if (relativeRunPath) {
        const normalized = normalizePathForUrl(relativeRunPath);
        const parts = normalized.split('/');
        if (parts.length < 4) {
            throw new Error(
                'SCREENSHOT_RELATIVE_RUN_DIR must look like screenshots/runs/YYYY-MM-DD/<run-id>.',
            );
        }
        return {
            runDate: parts[2] ?? runDate ?? 'unknown-date',
            runId: parts[3] ?? runId ?? 'unknown-run',
            relativeRunPath: relativeRunPath,
            absoluteRunPath: path.join(projectRoot, relativeRunPath),
        };
    }

    if (runDate && runId) {
        const relative = path.join('screenshots', 'runs', runDate, runId);
        return {
            runDate,
            runId,
            relativeRunPath: relative,
            absoluteRunPath: path.join(projectRoot, relative),
        };
    }

    return null;
}

async function listPngFiles(runPath: string): Promise<string[]> {
    const files = await readdir(runPath, { withFileTypes: true });
    return files
        .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
        .map((entry) => entry.name)
        .sort();
}

function imageUrlFor(
    branch: string,
    repoSlug: string,
    relativeRunPath: string,
    filename: string,
): string {
    const relativeFilePath = normalizePathForUrl(
        path.join(relativeRunPath, filename),
    );
    return `https://raw.githubusercontent.com/${repoSlug}/${branch}/${relativeFilePath}`;
}

function buildMarkdown(
    context: RunContext,
    imageNames: string[],
    branch: string,
    repoSlug: string,
    runBy: string,
): string {
    const header = [
        `### Screenshot update (${context.runDate} · ${context.runId})`,
        '',
        `Captured by: ${runBy}`,
        `Run path: \`${normalizePathForUrl(context.relativeRunPath)}\``,
        '',
    ];

    const body = imageNames.flatMap((imageName) => {
        const title = imageName.replace(/\.png$/i, '');
        const url = imageUrlFor(
            branch,
            repoSlug,
            context.relativeRunPath,
            imageName,
        );
        return [`#### ${title}`, `![${title}](${url})`, ''];
    });

    return [...header, ...body].join('\n');
}

async function linearGraphQL<T>(
    apiKey: string,
    query: string,
    variables: Record<string, unknown>,
): Promise<T> {
    const response = await fetch(LINEAR_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(
            `Linear API request failed with status ${response.status}`,
        );
    }

    const payload = (await response.json()) as {
        data?: T;
        errors?: Array<{ message?: string }>;
    };

    if (payload.errors?.length) {
        const message = payload.errors.map((error) => error.message).join('; ');
        throw new Error(`Linear API returned errors: ${message}`);
    }

    if (!payload.data) {
        throw new Error('Linear API returned no data.');
    }

    return payload.data;
}

async function createIssueComment(
    apiKey: string,
    issueId: string,
    body: string,
): Promise<void> {
    const mutation = `
        mutation CreateComment($issueId: String!, $body: String!) {
            commentCreate(input: { issueId: $issueId, body: $body }) {
                success
            }
        }
    `;

    type ResponseShape = {
        commentCreate: { success: boolean };
    };

    const data = await linearGraphQL<ResponseShape>(apiKey, mutation, {
        issueId,
        body,
    });

    if (!data.commentCreate.success) {
        throw new Error('Linear commentCreate returned success=false.');
    }
}

async function main() {
    const projectRoot = process.cwd();
    const linearApiKey = requireEnv('LINEAR_API_KEY');
    const linearIssueId = requireEnv('LINEAR_ISSUE_ID');
    const branch = process.env.SCREENSHOT_GITHUB_BRANCH ?? 'main';
    const runBy = process.env.GITHUB_ACTOR ?? 'local';
    const repoSlug = resolveRepoSlug();

    const explicitRun = resolveRunFromEnv(projectRoot);
    const runContext = explicitRun ?? (await resolveLatestRun(projectRoot));
    const imageNames = await listPngFiles(runContext.absoluteRunPath);

    if (!imageNames.length) {
        throw new Error(
            `No PNG files found at ${normalizePathForUrl(runContext.relativeRunPath)}.`,
        );
    }

    const markdown = buildMarkdown(
        runContext,
        imageNames,
        branch,
        repoSlug,
        runBy,
    );
    await createIssueComment(linearApiKey, linearIssueId, markdown);

    console.log(
        `Posted ${imageNames.length} screenshots to Linear issue ${linearIssueId} from ${runContext.runDate}/${runContext.runId}.`,
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
