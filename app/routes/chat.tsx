import { useState } from 'react';
import { Container } from '~/components/Container';
import { authMiddleware } from '~/middleware/auth';
import { listItemClassName, navLinkClassName } from '~/shared';
import type { Route } from './+types/chat';
import {
    createThread,
    deleteThread,
    getAllThreadsByUserId,
    getThreadById,
} from '~/models/thread.server';
import { getUserFromSession } from '~/models/session.server';
import invariant from 'tiny-invariant';
import {
    Form,
    Link,
    NavLink,
    Outlet,
    redirect,
    useNavigation,
    useParams,
    useSubmit,
} from 'react-router';
import {
    ArrowLeftIcon,
    LoaderCircleIcon,
    PlusCircleIcon,
    Trash2Icon,
} from 'lucide-react';
import { Badge, Button } from 'rivet-ui';
import { cx } from 'cva.config';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const threads = await getAllThreadsByUserId(user.id);
    invariant(threads, 'Threads could not be found for user');

    return {
        threads,
    };
}

export async function action({ request }: Route.ActionArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const form = await request.formData();
    const intent = String(form.get('intent'));

    if (request.method === 'POST') {
        if (intent === 'new-thread') {
            try {
                const thread = await createThread(user.id);

                return redirect(thread?.id);
            } catch {
                throw new Response('Failed to create thread', { status: 500 });
            }
        }

        if (intent === 'delete-thread') {
            const threadId = String(form.get('threadId'));
            const thread = await getThreadById(threadId);

            invariant(thread, 'Thread not found');
            invariant(thread.createdById === user.id, 'Unauthorized');

            await deleteThread(threadId);

            return redirect('/chat');
        }
    }

    return null;
}

function getThreadLabel(thread: {
    title?: string | null;
    messages: { content: string }[];
}): string {
    if (thread.title && thread.title !== 'Untitled') return thread.title;

    try {
        const parts = JSON.parse(thread.messages[0]?.content ?? '[]');
        const text = parts
            .filter((p: { type: string }) => p.type === 'text')
            .map((p: { text: string }) => p.text)
            .join('');

        return text.length > 30
            ? `${text.slice(0, 30)}...`
            : text || 'New Thread';
    } catch {
        return 'New Thread';
    }
}

export default function ChatRoute({ loaderData }: Route.ComponentProps) {
    const { threadId } = useParams();
    const hasActiveThread = Boolean(threadId);
    const navigation = useNavigation();
    const submit = useSubmit();
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const formData = navigation.formData;
    const intent = formData?.get('intent');
    const isCreating = navigation.state !== 'idle' && intent === 'new-thread';
    const deletingThreadId =
        navigation.state !== 'idle' && intent === 'delete-thread'
            ? String(formData?.get('threadId'))
            : null;

    function openDeleteDialog(threadId: string) {
        setPendingDeleteId(threadId);
        setConfirmOpen(true);
    }

    function closeDeleteDialog() {
        setConfirmOpen(false);
        setPendingDeleteId(null);
    }

    return (
        <>
            <title>Chat | maggies-mental-load</title>
            <meta
                name="description"
                content="Capture thoughts, organize priorities, and turn overwhelm into actionable household plans."
            />
            <Container className="flex min-h-0 grow flex-col gap-2 p-1 md:gap-4 md:p-3">
                <header className="border-kraft/10 flex items-center justify-between gap-2 border-b pb-2 md:pb-4">
                    <div className="flex items-center gap-2">
                        {hasActiveThread && (
                            <Link
                                to="/chat"
                                className="text-kraft/70 hover:text-kraft flex items-center gap-1 text-sm transition-colors md:hidden"
                            >
                                <ArrowLeftIcon
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                                Threads
                            </Link>
                        )}
                        <h1 className="font-display text-kraft text-lg font-semibold md:text-2xl">
                            Plan with Maggie
                        </h1>
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                        <Badge variant="denim">Private workspace</Badge>
                    </div>
                    <Form method="POST">
                        <input type="hidden" name="intent" value="new-thread" />
                        <Button
                            type="submit"
                            disabled={isCreating}
                            variant="primary"
                            size="sm"
                        >
                            {isCreating ? (
                                <LoaderCircleIcon
                                    aria-hidden="true"
                                    className="h-4 w-4 animate-spin"
                                />
                            ) : (
                                <PlusCircleIcon
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                            )}
                            <span className="ml-1 hidden sm:inline">
                                New thread
                            </span>
                        </Button>
                    </Form>
                </header>
                <div className="flex min-h-0 grow flex-col gap-4 md:grid md:grid-cols-12 md:grid-rows-[1fr]">
                    <section
                        className={cx(
                            'border-kraft/12 bg-canvas rounded-box min-h-0 overflow-y-auto border p-3 md:col-span-5 md:block lg:col-span-4',
                            hasActiveThread ? 'hidden' : 'grow',
                        )}
                    >
                        <nav aria-label="Conversations">
                            <ul className="flex flex-col gap-4">
                                {loaderData.threads &&
                                loaderData.threads.length > 0 ? (
                                    loaderData.threads.map((thread) => (
                                        <li
                                            key={thread.id}
                                            className="group relative"
                                        >
                                            <NavLink
                                                to={thread.id}
                                                className={navLinkClassName}
                                            >
                                                <span className="truncate pr-6">
                                                    {getThreadLabel(thread)}
                                                </span>
                                            </NavLink>
                                            <button
                                                type="button"
                                                aria-label="Delete thread"
                                                className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                                                disabled={
                                                    deletingThreadId ===
                                                    thread.id
                                                }
                                                onClick={() =>
                                                    openDeleteDialog(thread.id)
                                                }
                                            >
                                                {deletingThreadId ===
                                                thread.id ? (
                                                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2Icon className="text-spool h-4 w-4" />
                                                )}
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li className={listItemClassName}>
                                        No conversations yet. Start one to get
                                        organized fast.
                                    </li>
                                )}
                            </ul>
                        </nav>
                    </section>
                    <div
                        className={cx(
                            'flex min-h-0 flex-col overflow-hidden md:col-span-7 md:flex lg:col-span-8',
                            hasActiveThread ? 'grow' : 'hidden',
                        )}
                    >
                        <Outlet />
                    </div>
                </div>
            </Container>
            <dialog
                open={isConfirmOpen}
                className="modal"
                onClose={closeDeleteDialog}
            >
                <div className="modal-box">
                    <h3 className="font-display text-kraft text-lg font-semibold">
                        Delete this conversation?
                    </h3>
                    <p className="text-kraft/70 py-3 text-sm">
                        This permanently removes the thread and its messages.
                    </p>
                    <div className="modal-action">
                        <Button variant="outline" onClick={closeDeleteDialog}>
                            Keep conversation
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                const form = new FormData();
                                form.set('intent', 'delete-thread');
                                form.set('threadId', pendingDeleteId ?? '');
                                submit(form, { method: 'POST' });
                                closeDeleteDialog();
                            }}
                        >
                            Delete conversation
                        </Button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="submit" onClick={closeDeleteDialog}>
                        close
                    </button>
                </form>
            </dialog>
        </>
    );
}
