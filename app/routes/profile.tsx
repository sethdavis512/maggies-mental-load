import invariant from 'tiny-invariant';
import { Container } from '~/components/Container';
import type { Route } from './+types/profile';
import { getUserFromSession } from '~/models/session.server';
import { authMiddleware } from '~/middleware/auth';
import { MailIcon, ShieldCheckIcon } from 'lucide-react';
import { Badge, Card, CardContent } from 'rivet-ui';

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
            <Container className="px-1 py-2 md:px-2 md:py-3">
                <header className="border-kraft/10 mb-6 border-b pb-6">
                    <div className="space-y-1">
                        <Badge variant="denim">Your account</Badge>
                        <h1 className="font-display text-kraft text-3xl font-semibold">
                            Profile
                        </h1>
                        <p className="text-kraft/65 text-sm">
                            Your account details and workspace permissions.
                        </p>
                    </div>
                </header>
                <Card className="max-w-2xl">
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="text-denim h-4 w-4" />
                            <Badge variant="outline">
                                {isAdmin ? 'Admin' : 'Member'}
                            </Badge>
                        </div>
                        <div className="text-kraft/75 flex items-center gap-2 text-sm">
                            <MailIcon className="text-denim h-4 w-4" />
                            <span>{loaderData.user.email}</span>
                        </div>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
}
