import {
    startTransition,
    useEffect,
    useReducer,
    useRef,
    useState,
} from 'react';
import {
    Form,
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useNavigation,
} from 'react-router';
import {
    HomeIcon,
    LockIcon,
    LogOutIcon,
    MenuIcon,
    MessageSquareIcon,
    StickyNoteIcon,
    UserCircle2Icon,
} from 'lucide-react';
import { getUserFromSession } from '~/models/session.server';
import type { Route } from './+types/root';
import { Container } from './components/Container';
import { listItemClassName, navLinkClassName } from './shared';
import { Drawer } from './components/Drawer';
import { Badge, Button, buttonVariants } from 'rivet-ui';

import './app.css';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@400..700&display=swap',
    },
];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);

    return {
        isAuthenticated: Boolean(user),
    };
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body className="h-full overflow-hidden">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

function DrawerContent({
    isAuthenticated,
    onClose,
}: {
    isAuthenticated: boolean;
    onClose: () => void;
}) {
    return (
        <nav aria-label="Mobile navigation">
            <ul className="flex flex-col gap-4">
                <li>
                    <NavLink
                        to="/"
                        className={navLinkClassName}
                        onClick={onClose}
                    >
                        <HomeIcon aria-hidden="true" className="h-6 w-6" />
                        Home
                    </NavLink>
                </li>
                {isAuthenticated && (
                    <>
                        <li>
                            <NavLink
                                to="/profile"
                                className={navLinkClassName}
                                onClick={onClose}
                            >
                                <UserCircle2Icon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                Profile
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/chat"
                                className={navLinkClassName}
                                onClick={onClose}
                            >
                                <MessageSquareIcon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                Chat
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/notes"
                                className={navLinkClassName}
                                onClick={onClose}
                            >
                                <StickyNoteIcon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                Notes
                            </NavLink>
                        </li>
                        <li>
                            <Form
                                method="POST"
                                action="/logout"
                                onSubmit={onClose}
                                className={listItemClassName}
                            >
                                <input
                                    type="hidden"
                                    name="intent"
                                    value="logout"
                                />
                                <LogOutIcon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                <button
                                    type="submit"
                                    className="cursor-pointer"
                                >
                                    Logout
                                </button>
                            </Form>
                        </li>
                    </>
                )}
                {!isAuthenticated && (
                    <li>
                        <NavLink
                            to="/login"
                            className={navLinkClassName}
                            onClick={onClose}
                        >
                            <LockIcon aria-hidden="true" className="h-6 w-6" />
                            Login
                        </NavLink>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default function App({ loaderData }: Route.ComponentProps) {
    const [isDrawerOpen, toggleDrawer] = useReducer((s) => !s, false);
    const navigationState = useNavigation().state;
    const [showLoading, setShowLoading] = useState(false);
    const minDisplayUntil = useRef(0);

    useEffect(() => {
        if (navigationState !== 'idle') {
            startTransition(() => setShowLoading(true));
            minDisplayUntil.current = Date.now() + 700;
        } else {
            const remaining = minDisplayUntil.current - Date.now();
            if (remaining > 0) {
                const timeout = setTimeout(
                    () => setShowLoading(false),
                    remaining,
                );
                return () => clearTimeout(timeout);
            }
            startTransition(() => setShowLoading(false));
        }
    }, [navigationState]);

    return (
        <Drawer
            className="h-full"
            contents={
                <DrawerContent
                    isAuthenticated={loaderData.isAuthenticated}
                    onClose={toggleDrawer}
                />
            }
            drawerContentClassName="flex h-full flex-col overflow-hidden"
            handleClose={toggleDrawer}
            id="main-drawer"
            isOpen={isDrawerOpen}
            right
        >
            <a
                href="#main-content"
                className="focus:bg-base-100 focus:text-base-content sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:px-4 focus:py-2 focus:outline"
            >
                Skip to main content
            </a>
            <header className="shrink-0">
                <nav
                    aria-label="Site"
                    className="bg-base-100/95 border-kraft/12 border-b py-4 backdrop-blur-sm"
                >
                    <Container className="flex items-center justify-between">
                        <ul className="flex gap-4 px-4">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:bg-kraft/6 flex items-center gap-2.5 rounded-full px-2 py-1 transition-colors"
                                >
                                    <div className="flex flex-col leading-tight">
                                        <strong className="font-display text-kraft text-[1.05rem] font-semibold tracking-tight">
                                            Maggie&apos;s Mental Load
                                        </strong>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                        <div>
                            <span
                                role="status"
                                aria-label="Loading"
                                className={`loading loading-dots transition-opacity duration-300 ${showLoading ? 'opacity-100' : 'opacity-0'}`}
                                aria-hidden={!showLoading}
                            />
                        </div>
                        <ul className="hidden items-center gap-2 px-4 md:flex">
                            {loaderData.isAuthenticated && (
                                <>
                                    <li>
                                        <Form
                                            method="POST"
                                            action="/logout"
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="hidden"
                                                name="intent"
                                                value="logout"
                                            />
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                            >
                                                <LogOutIcon
                                                    aria-hidden="true"
                                                    className="h-4 w-4"
                                                />
                                                Sign out
                                            </Button>
                                        </Form>
                                    </li>
                                </>
                            )}
                            {!loaderData.isAuthenticated && (
                                <li>
                                    <Link
                                        to="/login"
                                        className={`${buttonVariants({ variant: 'primary', size: 'sm' })} rounded-full`}
                                    >
                                        <LockIcon
                                            aria-hidden="true"
                                            className="h-4 w-4"
                                        />
                                        Sign in
                                    </Link>
                                </li>
                            )}
                        </ul>
                        <Button
                            type="button"
                            variant="ghost"
                            className="mx-4 px-2 md:hidden"
                            onClick={toggleDrawer}
                            aria-label="Open navigation menu"
                            aria-expanded={isDrawerOpen}
                            aria-controls="main-drawer"
                        >
                            <MenuIcon aria-hidden="true" className="h-6 w-6" />
                        </Button>
                    </Container>
                </nav>
            </header>
            <main
                id="main-content"
                tabIndex={-1}
                className="bg-canvas min-h-0 grow overflow-hidden py-4"
            >
                <Container className="grid h-full grid-cols-1 gap-4 md:grid-cols-12">
                    <div className="border-kraft/12 bg-surface rounded-box hidden border md:col-span-4 md:block lg:col-span-3">
                        <div className="p-3 md:p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-kraft/55 text-xs font-semibold tracking-[0.14em] uppercase">
                                    Daily Dashboard
                                </p>
                                <Badge variant="mustard">Today</Badge>
                            </div>
                            <nav aria-label="Main navigation">
                                <ul className="flex flex-col gap-4 p-4">
                                    <li>
                                        <NavLink
                                            to="/"
                                            className={navLinkClassName}
                                        >
                                            <HomeIcon
                                                aria-hidden="true"
                                                className="h-6 w-6"
                                            />
                                            Home
                                        </NavLink>
                                    </li>
                                    {loaderData.isAuthenticated && (
                                        <>
                                            <li>
                                                <NavLink
                                                    to="/profile"
                                                    className={navLinkClassName}
                                                >
                                                    <UserCircle2Icon
                                                        aria-hidden="true"
                                                        className="h-6 w-6"
                                                    />
                                                    Profile
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    to="/chat"
                                                    className={navLinkClassName}
                                                >
                                                    <MessageSquareIcon
                                                        aria-hidden="true"
                                                        className="h-6 w-6"
                                                    />
                                                    Chat
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    to="/notes"
                                                    className={navLinkClassName}
                                                >
                                                    <StickyNoteIcon
                                                        aria-hidden="true"
                                                        className="h-6 w-6"
                                                    />
                                                    Notes
                                                </NavLink>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <div className="border-kraft/12 bg-surface rounded-box col-span-1 flex min-h-0 flex-col overflow-y-auto border md:col-span-8 lg:col-span-9">
                        <div className="flex min-h-0 grow flex-col p-4 md:p-6">
                            <Outlet />
                        </div>
                    </div>
                </Container>
            </main>
            <footer className="border-kraft/10 bg-surface shrink-0 border-t py-4">
                <Container className="px-4">
                    <p className="text-kraft/65 text-sm">
                        Built for real households, real calendars, and real-life
                        chaos. Check that off your list. ✓
                    </p>
                </Container>
            </footer>
        </Drawer>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main role="alert" className="container mx-auto p-4 pt-16">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full overflow-x-auto p-4">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
