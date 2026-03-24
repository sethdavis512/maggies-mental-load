import {
    CalendarIcon,
    CheckIcon,
    CircleCheckBigIcon,
    ListTodoIcon,
    LoaderCircleIcon,
    PlusCircleIcon,
} from 'lucide-react';

interface TaskToolPartProps {
    toolName: string;
    state: string;
    output?: Record<string, unknown>;
}

const LABELS: Record<string, string> = {
    create_task: 'Adding to your list',
    list_tasks: 'Pulling up your tasks',
    complete_task: 'Checking that off',
};

const ICONS: Record<string, typeof ListTodoIcon> = {
    create_task: PlusCircleIcon,
    list_tasks: ListTodoIcon,
    complete_task: CircleCheckBigIcon,
};

const URGENCY_COLORS: Record<string, string> = {
    red: 'badge-error',
    yellow: 'badge-warning',
    green: 'badge-success',
};

interface TaskOutput {
    id: string;
    title: string;
    category: string;
    urgency: string;
    deadline: string | null;
    completedAt: string | null;
}

export function TaskToolPart({ toolName, state, output }: TaskToolPartProps) {
    const isLoading =
        state === 'input-available' || state === 'input-streaming';
    const isDone = state === 'output-available';
    const Icon = ICONS[toolName] ?? ListTodoIcon;
    const label = LABELS[toolName] ?? toolName;

    return (
        <div className="rounded-box border-base-300 bg-base-200 mt-2 border p-3 text-sm">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{label}</span>
                {isLoading && (
                    <LoaderCircleIcon
                        className="h-3 w-3 animate-spin"
                        aria-hidden="true"
                    />
                )}
                {isDone && (
                    <CheckIcon
                        className="text-success h-3 w-3"
                        aria-hidden="true"
                    />
                )}
            </div>

            {isDone && toolName === 'create_task' && output && (
                <p className="mt-1 text-xs opacity-80">
                    Added: {String(output.title)}
                    {output.deadline ? (
                        <span className="ml-1">
                            <CalendarIcon
                                className="mr-0.5 inline h-3 w-3"
                                aria-hidden="true"
                            />
                            {String(output.deadline).split('T')[0]}
                        </span>
                    ) : null}
                </p>
            )}

            {isDone && toolName === 'complete_task' && output && (
                <p className="mt-1 text-xs opacity-80">
                    Done: {String(output.title)}
                </p>
            )}

            {isDone && toolName === 'list_tasks' && output && (
                <ul className="mt-1 space-y-1">
                    {((output.tasks as TaskOutput[] | undefined) ?? []).map(
                        (task) => (
                            <li
                                key={task.id}
                                className="flex items-center gap-1.5 text-xs opacity-80"
                            >
                                {task.completedAt ? (
                                    <CircleCheckBigIcon className="text-success h-3 w-3 shrink-0" />
                                ) : (
                                    <span
                                        className={`badge badge-xs ${URGENCY_COLORS[task.urgency] ?? 'badge-ghost'}`}
                                    />
                                )}
                                <span>{task.title}</span>
                                <span className="opacity-60">
                                    [{task.category}]
                                </span>
                            </li>
                        ),
                    )}
                </ul>
            )}
        </div>
    );
}
