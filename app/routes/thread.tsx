import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import {
    CircleXIcon,
    LoaderCircleIcon,
    RefreshCwIcon,
    SendHorizonalIcon,
    StopCircleIcon,
    WrenchIcon,
    XIcon,
} from 'lucide-react';
import { Alert, AlertDescription, Badge, Button } from 'rivet-ui';
import { ChatBubble } from '~/components/ChatBubble';
import { Markdown } from '~/components/Markdown';
import { NoteToolPart } from '~/components/NoteToolPart';
import { TaskToolPart } from '~/components/TaskToolPart';
import type { Route } from './+types/thread';
import { getThreadById } from '~/models/thread.server';
import { authMiddleware } from '~/middleware/auth';
import { getUserFromSession } from '~/models/session.server';
import invariant from 'tiny-invariant';
import { data, isRouteErrorResponse, useRouteError } from 'react-router';
import { useEffect, useRef, useState } from 'react';

const transport = new DefaultChatTransport({
    api: '/api/chat',
    credentials: 'include',
});

const PRESET_MESSAGES = [
    {
        label: 'Brain dump',
        value: 'I need to get everything out of my head. Let me brain dump and help me sort it into actionable next steps.',
    },
    {
        label: 'Meal plan',
        value: 'Help me plan meals for the week and build a grocery list organized by store section.',
    },
    {
        label: 'Home ops',
        value: 'Walk me through what needs attention around the house right now, including cleaning, maintenance, and seasonal tasks.',
    },
    {
        label: 'Kids & family',
        value: 'Help me stay on top of the kids -- appointments, activities, milestones, and anything coming up.',
    },
    {
        label: 'Plan my week',
        value: 'Show me what is on my task list and help me plan and prioritize the week ahead.',
    },
    {
        label: 'Budget check',
        value: 'Help me review upcoming bills, subscriptions, and expenses so nothing catches me off guard.',
    },
    {
        label: 'Household manual',
        value: 'Show me my household manual -- vendors, providers, child profiles, and family preferences.',
    },
    {
        label: 'Next steps',
        value: 'Based on everything we have discussed, what are the most important next steps I should take?',
    },
];

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const thread = await getThreadById(params.threadId);
    invariant(thread, 'Thread could not be found');

    if (thread.createdById !== user.id) {
        throw data('Forbidden', { status: 403 });
    }

    const messages: UIMessage[] = thread.messages.flatMap((msg) => {
        let parts: UIMessage['parts'];
        try {
            parts = JSON.parse(msg.content);
        } catch {
            parts = [{ type: 'text' as const, text: msg.content }];
        }

        if (!Array.isArray(parts)) {
            parts = [{ type: 'text' as const, text: msg.content }];
        }

        return {
            id: msg.id,
            role:
                msg.role === 'USER'
                    ? ('user' as const)
                    : ('assistant' as const),
            content: '',
            parts,
            createdAt: msg.createdAt,
        };
    });

    return {
        thread: { ...thread, messages },
    };
}

type ToolPartState = 'input-available' | 'input-streaming' | 'output-available';

interface ToolPart {
    toolCallId: string;
    toolName: string;
    state: ToolPartState;
}

function isToolPart(part: {
    type: string;
}): part is ToolPart & { type: string } {
    return part.type.startsWith('tool-') || part.type === 'dynamic-tool';
}

const NOTE_TOOLS = new Set(['create_note', 'list_notes', 'search_notes']);
const TASK_TOOLS = new Set(['create_task', 'list_tasks', 'complete_task']);
function ToolPartFallback({ part }: { part: ToolPart }) {
    return (
        <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
            <WrenchIcon aria-hidden="true" className="h-3 w-3" />
            <span>
                {part.toolName}
                {part.state === 'output-available' && ' \u2713'}
                {(part.state === 'input-available' ||
                    part.state === 'input-streaming') &&
                    ' \u2026'}
            </span>
        </div>
    );
}

export default function ThreadRoute({
    loaderData,
    params,
}: Route.ComponentProps) {
    const [chatInput, setChatInput] = useState('');
    const messageRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        messages,
        sendMessage,
        error,
        clearError,
        regenerate,
        status,
        stop,
    } = useChat({
        id: params.threadId,
        messages: loaderData?.thread.messages,
        transport,
        onError: (error) => {
            console.error('Chat error:', error);
        },
    });

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollTop = messageRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!chatInput.trim()) return;
        sendMessage({ text: chatInput });
        setChatInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    return (
        <>
            {error && (
                <Alert variant="error">
                    <div className="flex w-full items-center justify-between gap-2">
                        <AlertDescription>
                            We hit a snag loading this response. Try again.
                        </AlertDescription>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => regenerate()}
                            >
                                <RefreshCwIcon
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                                Retry
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => clearError()}
                            >
                                <XIcon aria-hidden="true" className="h-4 w-4" />
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </Alert>
            )}
            <div
                ref={messageRef}
                aria-live="polite"
                aria-busy={status === 'streaming'}
                className="rounded-box bg-base-100 flex min-h-0 grow flex-col gap-3 overflow-y-auto px-2 py-1 sm:gap-4 sm:p-4"
            >
                {/* Spacer pushes messages to the bottom. Using justify-end with
                   overflow-y-auto causes upward overflow that is unreachable
                   by scrolling, so we use a grow spacer instead. */}
                <div className="grow" />
                {messages.length > 0 ? (
                    messages.map((message) => {
                        const isUser = message.role === 'user';

                        const textContent = message.parts
                            .filter(
                                (part) =>
                                    part.type === 'text' && 'text' in part,
                            )
                            .map((part) => part.text)
                            .join('\n\n');

                        const toolParts = message.parts.filter((part) =>
                            isToolPart(part),
                        ) as unknown as ToolPart[];

                        const content = (
                            <>
                                {textContent && (
                                    <Markdown>{textContent}</Markdown>
                                )}
                                {toolParts.map((part) => {
                                    const output =
                                        part.state === 'output-available'
                                            ? (
                                                  part as unknown as {
                                                      output: Record<
                                                          string,
                                                          unknown
                                                      >;
                                                  }
                                              ).output
                                            : undefined;

                                    if (NOTE_TOOLS.has(part.toolName)) {
                                        return (
                                            <NoteToolPart
                                                key={part.toolCallId}
                                                toolName={part.toolName}
                                                state={part.state}
                                                output={output}
                                            />
                                        );
                                    }

                                    if (TASK_TOOLS.has(part.toolName)) {
                                        return (
                                            <TaskToolPart
                                                key={part.toolCallId}
                                                toolName={part.toolName}
                                                state={part.state}
                                                output={output}
                                            />
                                        );
                                    }

                                    return (
                                        <ToolPartFallback
                                            key={part.toolCallId}
                                            part={part}
                                        />
                                    );
                                })}
                                {!textContent &&
                                    toolParts.length === 0 &&
                                    !isUser &&
                                    status !== 'ready' &&
                                    message ===
                                        messages[messages.length - 1] && (
                                        <span
                                            role="status"
                                            aria-label="Loading response"
                                        >
                                            <LoaderCircleIcon
                                                aria-hidden="true"
                                                className="h-5 w-5 animate-spin"
                                            />
                                        </span>
                                    )}
                            </>
                        );

                        return (
                            <ChatBubble
                                key={message.id}
                                variant={isUser ? 'primary' : 'default'}
                                placement={isUser ? 'end' : 'start'}
                            >
                                {content}
                            </ChatBubble>
                        );
                    })
                ) : (
                    <div className="border-kraft/12 bg-canvas rounded-box mx-auto mt-auto max-w-md border p-4 text-center">
                        <div className="space-y-2">
                            <Badge variant="mustard">Ready when you are</Badge>
                            <p className="text-kraft/70 text-sm">
                                Start with one sentence. Maggie will help you
                                turn it into a plan.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2 px-2 pb-2 sm:gap-3 sm:px-4 sm:pb-4">
                <div className="my-2 flex gap-2 overflow-x-auto px-1 md:flex-wrap">
                    {PRESET_MESSAGES.map(({ label, value }) => (
                        <Button
                            key={label}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="shrink-0 rounded-full"
                            onClick={() => sendMessage({ text: value })}
                            disabled={status !== 'ready'}
                            title={value}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                <div className="rounded-box border-base-300 bg-base-100 flex items-end gap-2 border p-2">
                    <textarea
                        ref={textareaRef}
                        id="chat-message-input"
                        aria-label="Message"
                        className="min-w-0 grow resize-none overflow-y-auto bg-transparent py-1 leading-normal outline-none"
                        style={{ maxHeight: '10rem' }}
                        placeholder="What's on your mind right now?"
                        value={chatInput}
                        onChange={(e) => {
                            setChatInput(e.target.value);
                            const el = e.target;
                            el.style.height = 'auto';
                            el.style.height = `${el.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={status !== 'ready'}
                        rows={1}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={stop}
                        disabled={
                            status !== 'streaming' && status !== 'submitted'
                        }
                    >
                        <StopCircleIcon
                            aria-hidden="true"
                            className="h-5 w-5"
                        />
                        <span className="sr-only sm:not-sr-only">Pause</span>
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSend}
                        disabled={status !== 'ready'}
                    >
                        <SendHorizonalIcon
                            aria-hidden="true"
                            className="h-5 w-5"
                        />
                        <span className="sr-only sm:not-sr-only">Send</span>
                    </Button>
                </div>
            </div>
        </>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <Alert variant="error" role="alert">
                <AlertDescription>
                    {error.status} {error.statusText}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert variant="error" role="alert">
            <AlertDescription>
                Experiencing technical difficulties. Please try again later.
            </AlertDescription>
        </Alert>
    );
}
