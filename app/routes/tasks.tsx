import invariant from 'tiny-invariant';
import { useFetcher } from 'react-router';
import { Container } from '~/components/Container';
import type { Route } from './+types/tasks';
import { getUserFromSession } from '~/models/session.server';
import { getTasksByUserId, completeTask, deleteTask } from '~/models/task.server';
import { authMiddleware } from '~/middleware/auth';
import {
    CalendarIcon,
    CheckCircle2Icon,
    CircleIcon,
    ListTodoIcon,
    Trash2Icon,
} from 'lucide-react';
import { Link } from 'react-router';
import { Badge, Button, Card, CardContent } from 'rivet-ui';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

const CATEGORIES: Record<string, string> = {
    mental: 'Mental load',
    meals: 'Meals & grocery',
    home: 'Home ops',
    kids: 'Kids & family',
    scheduling: 'Scheduling',
    finance: 'Finance',
};

type BadgeVariant = 'spool' | 'mustard' | 'ribbon';

const URGENCY_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
    red: { variant: 'spool', label: 'Do today' },
    yellow: { variant: 'mustard', label: 'This week' },
    green: { variant: 'ribbon', label: 'When you can' },
};

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const url = new URL(request.url);
    const showCompleted = url.searchParams.get('completed') === '1';
    const category = url.searchParams.get('category') ?? undefined;

    const tasks = await getTasksByUserId(user.id, {
        category,
        includeCompleted: showCompleted,
    });

    return { tasks, showCompleted, category };
}

export async function action({ request }: Route.ActionArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const formData = await request.formData();
    const intent = formData.get('intent');
    const taskId = String(formData.get('taskId'));

    if (intent === 'complete') {
        await completeTask(taskId, user.id);
    } else if (intent === 'delete') {
        await deleteTask(taskId, user.id);
    }

    return { ok: true };
}

export default function TasksRoute({ loaderData }: Route.ComponentProps) {
    const { tasks, showCompleted, category } = loaderData;

    const grouped = new Map<string, typeof tasks>();
    for (const task of tasks) {
        const group = grouped.get(task.category) ?? [];
        group.push(task);
        grouped.set(task.category, group);
    }

    // Sort categories by the order in CATEGORIES
    const categoryOrder = Object.keys(CATEGORIES);
    const sortedGroups = [...grouped.entries()].sort(
        (a, b) => categoryOrder.indexOf(a[0]) - categoryOrder.indexOf(b[0]),
    );

    return (
        <>
            <title>Tasks | Maggie&apos;s Mental Load</title>
            <meta
                name="description"
                content="View and manage your household tasks."
            />
            <div className="h-full overflow-y-auto">
                <Container className="p-2 md:p-4">
                    <header className="border-kraft/10 mb-5 border-b pb-6">
                        <Badge variant="ribbon" className="mb-2">
                            Action items
                        </Badge>
                        <h1 className="font-display text-kraft text-3xl font-semibold">
                            Your task list
                        </h1>
                        <p className="text-kraft/65 text-sm">
                            Everything Maggie has captured, in one place.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <FilterLink
                                to="/tasks"
                                active={!category && !showCompleted}
                            >
                                All open
                            </FilterLink>
                            {Object.entries(CATEGORIES).map(([key, label]) => (
                                <FilterLink
                                    key={key}
                                    to={`/tasks?category=${key}`}
                                    active={category === key}
                                >
                                    {label}
                                </FilterLink>
                            ))}
                            <FilterLink
                                to="/tasks?completed=1"
                                active={showCompleted}
                            >
                                Completed
                            </FilterLink>
                        </div>
                    </header>

                    {tasks.length > 0 ? (
                        <div className="space-y-6">
                            {sortedGroups.map(([cat, catTasks]) => (
                                <section key={cat}>
                                    <h2 className="text-kraft/55 mb-3 text-xs font-semibold tracking-[0.14em] uppercase">
                                        {CATEGORIES[cat] ?? cat}
                                    </h2>
                                    <ul className="space-y-2">
                                        {catTasks.map((task) => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                            />
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="border-kraft/12 bg-canvas rounded-box mt-5 max-w-xl border p-5">
                            <div className="space-y-3">
                                <p className="text-kraft/70 text-sm">
                                    {showCompleted
                                        ? 'No completed tasks yet. Keep going!'
                                        : 'No open tasks. Ask Maggie to capture what you need to get done.'}
                                </p>
                                <Link
                                    to="/chat"
                                    className="text-denim text-sm font-semibold underline-offset-2 hover:underline"
                                >
                                    Open chat
                                </Link>
                            </div>
                        </div>
                    )}
                </Container>
            </div>
        </>
    );
}

function TaskItem({
    task,
}: {
    task: {
        id: string;
        title: string;
        urgency: string;
        deadline: Date | null;
        completedAt: Date | null;
    };
}) {
    const fetcher = useFetcher();
    const isCompleting = fetcher.formData?.get('intent') === 'complete';
    const isDeleting = fetcher.formData?.get('intent') === 'delete';
    const isOptimisticallyDone = isCompleting || isDeleting;

    if (isOptimisticallyDone) return null;

    const urgencyInfo = URGENCY_BADGE[task.urgency];

    return (
        <li>
            <Card>
                <CardContent className="flex items-center gap-3 py-3">
                    {task.completedAt ? (
                        <CheckCircle2Icon
                            aria-hidden="true"
                            className="text-success h-5 w-5 shrink-0"
                        />
                    ) : (
                        <fetcher.Form method="POST">
                            <input
                                type="hidden"
                                name="taskId"
                                value={task.id}
                            />
                            <input
                                type="hidden"
                                name="intent"
                                value="complete"
                            />
                            <button
                                type="submit"
                                className="text-kraft/30 hover:text-success cursor-pointer transition-colors"
                                aria-label={`Mark "${task.title}" complete`}
                            >
                                <CircleIcon
                                    aria-hidden="true"
                                    className="h-5 w-5"
                                />
                            </button>
                        </fetcher.Form>
                    )}

                    <div className="min-w-0 flex-1">
                        <p
                            className={`text-sm font-medium ${task.completedAt ? 'text-kraft/40 line-through' : 'text-kraft'}`}
                        >
                            {task.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            {urgencyInfo && !task.completedAt && (
                                <Badge
                                    variant={urgencyInfo.variant}
                                    className="text-[0.65rem]"
                                >
                                    {urgencyInfo.label}
                                </Badge>
                            )}
                            {task.deadline && (
                                <span className="text-kraft/50 flex items-center gap-1 text-xs">
                                    <CalendarIcon
                                        aria-hidden="true"
                                        className="h-3 w-3"
                                    />
                                    {new Date(
                                        task.deadline,
                                    ).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                        </div>
                    </div>

                    {!task.completedAt && (
                        <fetcher.Form method="POST">
                            <input
                                type="hidden"
                                name="taskId"
                                value={task.id}
                            />
                            <input
                                type="hidden"
                                name="intent"
                                value="delete"
                            />
                            <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="text-kraft/30 hover:text-error"
                                aria-label={`Delete "${task.title}"`}
                            >
                                <Trash2Icon
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                            </Button>
                        </fetcher.Form>
                    )}
                </CardContent>
            </Card>
        </li>
    );
}

function FilterLink({
    to,
    active,
    children,
}: {
    to: string;
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            to={to}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                    ? 'bg-denim text-white'
                    : 'bg-kraft/8 text-kraft/60 hover:bg-kraft/14'
            }`}
        >
            {children}
        </Link>
    );
}
