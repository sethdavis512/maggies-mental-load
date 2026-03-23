import invariant from 'tiny-invariant';
import { Container } from '~/components/Container';
import type { Route } from './+types/profile';
import { getUserFromSession } from '~/models/session.server';
import { authMiddleware } from '~/middleware/auth';
import { MailIcon, ShieldCheckIcon } from 'lucide-react';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    return {
        user,
    };
}

export default function ProfileRoute({ loaderData }: Route.ComponentProps) {
    const isAdmin = loaderData.user.role === 'ADMIN';

    return (
        <>
            <title>Profile</title>
            <meta
                name="description"
                content="View your household account details and permission level."
            />
            <Container className="p-2 md:p-4">
                <section className="border-kraft/12 bg-surface rounded-box max-w-2xl border p-6">
                    <header className="pb-2">
                        <h1 className="font-display text-2xl">Profile</h1>
                        <p className="text-kraft/65 text-sm">
                            Your account details and workspace permissions.
                        </p>
                    </header>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="text-denim h-4 w-4" />
                            <span className="badge badge-outline">
                                {isAdmin ? 'Admin' : 'Member'}
                            </span>
                        </div>
                        <div className="text-kraft/75 flex items-center gap-2 text-sm">
                            <MailIcon className="text-denim h-4 w-4" />
                            <span>{loaderData.user.email}</span>
                        </div>
                    </div>
                </section>
            </Container>
        </>
    );
}
