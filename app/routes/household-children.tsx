import invariant from 'tiny-invariant';
import { Link, useFetcher } from 'react-router';
import { Container } from '~/components/Container';
import type { Route } from './+types/household-children';
import { getUserFromSession } from '~/models/session.server';
import { getChildrenByUserId, deleteChild } from '~/models/child.server';
import {
    BabyIcon,
    HeartPulseIcon,
    PaletteIcon,
    PlusIcon,
    StethoscopeIcon,
    Trash2Icon,
} from 'lucide-react';
import {
    Badge,
    Button,
    buttonVariants,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'rivet-ui';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const children = await getChildrenByUserId(user.id);
    return { children };
}

export async function action({ request }: Route.ActionArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'delete') {
        const childId = String(formData.get('childId'));
        invariant(childId, 'childId is required');
        await deleteChild(childId, user.id);
    }

    return { ok: true };
}

export default function HouseholdChildrenRoute({
    loaderData,
}: Route.ComponentProps) {
    const { children } = loaderData;

    return (
        <>
            <title>Children | Household Manual</title>
            <meta
                name="description"
                content="Your children's profiles and details."
            />
            <div className="h-full overflow-y-auto">
                <Container className="p-2 md:p-4">
                    <header className="border-kraft/10 mb-5 border-b pb-6">
                        <Badge variant="ribbon" className="mb-2">
                            Family profiles
                        </Badge>
                        <div className="flex items-center justify-between">
                            <h1 className="font-display text-kraft text-3xl font-semibold">
                                Children
                            </h1>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                aria-label="Add child (coming soon)"
                            >
                                <PlusIcon className="mr-1 h-4 w-4" />
                                Add child
                            </Button>
                        </div>
                        <p className="text-kraft/65 mt-1 text-sm">
                            {children.length > 0
                                ? `${children.length} ${children.length === 1 ? 'child' : 'children'} in your family profile.`
                                : 'Tell Maggie about your little ones to get started.'}
                        </p>
                    </header>

                    {children.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {children.map((child) => (
                                <ChildCard key={child.id} child={child} />
                            ))}
                        </div>
                    ) : (
                        <div className="border-kraft/12 bg-canvas rounded-box mt-5 max-w-xl border p-5">
                            <div className="space-y-3">
                                <p className="text-kraft/70 text-sm">
                                    No children added yet. Tell Maggie about
                                    your little ones in chat.
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

                    <div className="mt-6">
                        <Link
                            to="/household"
                            className={buttonVariants({
                                variant: 'ghost',
                                size: 'sm',
                            })}
                        >
                            Back to Household Manual
                        </Link>
                    </div>
                </Container>
            </div>
        </>
    );
}

function ChildCard({
    child,
}: {
    child: {
        id: string;
        name: string;
        birthday: Date | null;
        allergies: string | null;
        interests: string | null;
        pediatrician: string | null;
    };
}) {
    const fetcher = useFetcher();
    const isDeleting = fetcher.formData?.get('intent') === 'delete';

    if (isDeleting) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BabyIcon className="text-ribbon h-5 w-5" />
                        {child.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {child.birthday && (
                            <Badge variant="denim" className="text-xs">
                                {formatAge(child.birthday)}
                            </Badge>
                        )}
                        <fetcher.Form method="POST">
                            <input
                                type="hidden"
                                name="childId"
                                value={child.id}
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
                                aria-label={`Delete ${child.name}`}
                            >
                                <Trash2Icon
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                            </Button>
                        </fetcher.Form>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <dl className="space-y-2 text-sm">
                    {child.allergies && (
                        <div className="flex items-start gap-2">
                            <dt className="flex shrink-0 items-center gap-1">
                                <HeartPulseIcon className="text-spool h-4 w-4" />
                                <span className="text-kraft/55 font-medium">
                                    Allergies
                                </span>
                            </dt>
                            <dd className="text-kraft">{child.allergies}</dd>
                        </div>
                    )}
                    {child.interests && (
                        <div className="flex items-start gap-2">
                            <dt className="flex shrink-0 items-center gap-1">
                                <PaletteIcon className="text-mustard h-4 w-4" />
                                <span className="text-kraft/55 font-medium">
                                    Interests
                                </span>
                            </dt>
                            <dd className="text-kraft">{child.interests}</dd>
                        </div>
                    )}
                    {child.pediatrician && (
                        <div className="flex items-start gap-2">
                            <dt className="flex shrink-0 items-center gap-1">
                                <StethoscopeIcon className="text-denim h-4 w-4" />
                                <span className="text-kraft/55 font-medium">
                                    Pediatrician
                                </span>
                            </dt>
                            <dd className="text-kraft">
                                {child.pediatrician}
                            </dd>
                        </div>
                    )}
                    {!child.allergies &&
                        !child.interests &&
                        !child.pediatrician &&
                        !child.birthday && (
                            <p className="text-kraft/45 text-xs italic">
                                No details yet. Chat with Maggie to fill in the
                                profile.
                            </p>
                        )}
                </dl>
            </CardContent>
        </Card>
    );
}

function formatAge(birthday: Date | string): string {
    const birth = new Date(birthday);
    const now = new Date();
    const months =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());
    if (months < 1) {
        return 'Newborn';
    }
    if (months < 12) {
        return `${months}mo`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
}
