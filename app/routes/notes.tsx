import invariant from 'tiny-invariant';
import { Container } from '~/components/Container';
import { Markdown } from '~/components/Markdown';
import type { Route } from './+types/notes';
import { getUserFromSession } from '~/models/session.server';
import { getNotesByUserId } from '~/models/note.server';
import { authMiddleware } from '~/middleware/auth';
import { FileTextIcon } from 'lucide-react';
import { Link } from 'react-router';
import { Badge, Card, CardContent, CardHeader } from 'rivet-ui';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const notes = await getNotesByUserId(user.id);

    return { notes };
}

export default function NotesRoute({ loaderData }: Route.ComponentProps) {
    const { notes } = loaderData;

    return (
        <>
            <title>Notes</title>
            <meta
                name="description"
                content="View and manage your saved notes."
            />
            <div className="h-full overflow-y-auto">
                <Container className="p-2 md:p-4">
                    <header className="border-kraft/10 mb-5 border-b pb-6">
                        <Badge variant="mustard" className="mb-2">
                            Memory
                        </Badge>
                        <h1 className="font-display text-kraft text-3xl font-semibold">
                            Saved notes
                        </h1>
                        <p className="text-kraft/65 text-sm">
                            Your important takeaways, all in one place.
                        </p>
                    </header>
                    {notes.length > 0 ? (
                        <ul className="mt-5 space-y-4">
                            {notes.map((note) => (
                                <li key={note.id}>
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-start gap-3">
                                                <FileTextIcon
                                                    aria-hidden="true"
                                                    className="text-spool mt-1 h-5 w-5 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <h2 className="text-lg font-semibold">
                                                        {note.title}
                                                    </h2>
                                                    <time
                                                        className="text-kraft/55 mt-1 block text-xs"
                                                        dateTime={new Date(
                                                            note.createdAt,
                                                        ).toISOString()}
                                                    >
                                                        {new Date(
                                                            note.createdAt,
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </time>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <details>
                                                <summary className="text-denim cursor-pointer text-sm font-medium">
                                                    Read note
                                                </summary>
                                                <div className="text-kraft/75 mt-2 text-sm">
                                                    <Markdown>
                                                        {note.content}
                                                    </Markdown>
                                                </div>
                                            </details>
                                        </CardContent>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="border-kraft/12 bg-canvas rounded-box mt-5 max-w-xl border p-5">
                            <div className="space-y-3">
                                <p className="text-kraft/70 text-sm">
                                    No notes yet. Ask Maggie to save key ideas
                                    while you chat.
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
