import {
    startTransition,
    useEffect,
    useReducer,
    useRef,
    useState,
} from 'react';
import {
    Form,
    Link,
    NavLink,
    Outlet,
    useNavigation,
} from 'react-router';
import {
    BookOpenIcon,
    HomeIcon,
    ListTodoIcon,
    LockIcon,
    LogOutIcon,
    MenuIcon,
    MessageSquareIcon,
    StickyNoteIcon,
    UserCircle2Icon,
} from 'lucide-react';
import { getUserFromSession } from '~/models/session.server';
import type { Route } from './+types/app-layout';
import { Container } from '~/components/Container';
import { listItemClassName, navLinkClassName } from '~/shared';
import { Drawer } from '~/components/Drawer';
import { Badge, Button, buttonVariants } from 'rivet-ui';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);

    return {
        isAuthenticated: Boolean(user),
    };
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
                        to="/dashboard"
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
                                to="/tasks"
                                className={navLinkClassName}
                                onClick={onClose}
                            >
                                <ListTodoIcon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                Tasks
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
                            <NavLink
                                to="/household"
                                className={navLinkClassName}
                                onClick={onClose}
                            >
                                <BookOpenIcon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                Household
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

export default function AppLayout({ loaderData }: Route.ComponentProps) {
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
            className="h-full overflow-hidden"
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
                className="bg-canvas min-h-0 grow overflow-hidden py-1 md:py-4"
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
                                            to="/dashboard"
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
                                                    to="/tasks"
                                                    className={navLinkClassName}
                                                >
                                                    <ListTodoIcon
                                                        aria-hidden="true"
                                                        className="h-6 w-6"
                                                    />
                                                    Tasks
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
                                            <li>
                                                <NavLink
                                                    to="/household"
                                                    className={navLinkClassName}
                                                >
                                                    <BookOpenIcon
                                                        aria-hidden="true"
                                                        className="h-6 w-6"
                                                    />
                                                    Household
                                                </NavLink>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <div className="bg-surface col-span-1 flex min-h-0 flex-col overflow-y-auto md:border-kraft/12 md:rounded-box md:border md:col-span-8 lg:col-span-9">
                        <div className="flex min-h-0 grow flex-col p-1 md:p-6">
                            <Outlet />
                        </div>
                    </div>
                </Container>
            </main>
            <footer className="border-kraft/10 bg-surface shrink-0 border-t py-2 md:py-4">
                <Container className="px-4">
                    <p className="text-kraft/45 text-xs">
                        &copy; {new Date().getFullYear()} Maggie&apos;s
                        Mental Load. All rights reserved.
                    </p>
                </Container>
            </footer>
        </Drawer>
    );
}
