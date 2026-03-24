import { Link, redirect } from 'react-router';
import {
    ArrowRightIcon,
    BrainIcon,
    CalendarClockIcon,
    CheckCircle2Icon,
    CookingPotIcon,
    ShieldCheckIcon,
    SparklesIcon,
} from 'lucide-react';
import { getUserFromSession } from '~/models/session.server';
import { buttonVariants } from 'rivet-ui';
import type { Route } from './+types/landing';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    if (user) throw redirect('/dashboard');
    return null;
}

export default function LandingRoute() {
    return (
        <>
            <title>Maggie&apos;s Mental Load | Mental Load, Managed.</title>
            <meta
                name="description"
                content="Your warm, organized partner for the beautiful chaos of running a household. Turn scattered responsibilities into one trusted, actionable system."
            />

            <div className="bg-canvas flex h-full flex-col overflow-y-auto md:flex-row">
                {/* ── Brand / hero panel ── */}
                <div className="relative flex flex-col justify-between overflow-hidden px-8 py-10 md:w-1/2 md:px-12 md:py-14 lg:w-[55%]">
                    <img
                        src="/login-hero.jpeg"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />

                    <div className="relative z-10">
                        <span className="font-display text-lg font-semibold text-white/90">
                            Maggie&apos;s Mental Load
                        </span>
                    </div>

                    <div className="relative z-10 mt-auto max-w-lg">
                        <p className="font-display hidden text-3xl leading-snug font-medium text-white md:block lg:text-4xl lg:leading-snug">
                            Mental Load, Managed.
                        </p>
                        <p className="mt-4 hidden text-base text-white/70 md:block">
                            Your warm, organized partner for the beautiful chaos
                            of running a household.
                        </p>
                        <p className="text-sm text-white/70 md:hidden">
                            Mental Load, Managed.
                        </p>
                    </div>
                </div>

                {/* ── Content panel ── */}
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-12">
                        <div className="w-full max-w-md">
                            <div className="text-ribbon mb-6 flex items-center gap-2 text-sm font-medium">
                                <SparklesIcon
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                                Built for working moms
                            </div>

                            <h1 className="font-display text-kraft text-2xl font-semibold md:text-3xl">
                                Scattered to sorted in&nbsp;minutes
                            </h1>
                            <p className="text-kraft/60 mt-2">
                                Maggie turns the invisible work of running a
                                household into clear, actionable steps — so you
                                can stop carrying it all in your head.
                            </p>

                            <ul className="mt-8 space-y-4">
                                <li className="flex items-start gap-3">
                                    <BrainIcon
                                        aria-hidden="true"
                                        className="text-denim mt-0.5 h-5 w-5 shrink-0"
                                    />
                                    <div>
                                        <p className="text-kraft text-sm font-medium">
                                            Brain dump, then breathe
                                        </p>
                                        <p className="text-kraft/55 text-sm">
                                            Pour out everything swirling in your
                                            head. Maggie organizes it into calm
                                            next steps.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CookingPotIcon
                                        aria-hidden="true"
                                        className="text-denim mt-0.5 h-5 w-5 shrink-0"
                                    />
                                    <div>
                                        <p className="text-kraft text-sm font-medium">
                                            Meals without the mental gymnastics
                                        </p>
                                        <p className="text-kraft/55 text-sm">
                                            Simple dinner decisions and grocery
                                            lists synced to real life.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CalendarClockIcon
                                        aria-hidden="true"
                                        className="text-denim mt-0.5 h-5 w-5 shrink-0"
                                    />
                                    <div>
                                        <p className="text-kraft text-sm font-medium">
                                            Deadlines, handoffs, handled
                                        </p>
                                        <p className="text-kraft/55 text-sm">
                                            School details, appointments, and
                                            logistics tracked without the mental
                                            tab overload.
                                        </p>
                                    </div>
                                </li>
                            </ul>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/login"
                                    className={buttonVariants({
                                        variant: 'primary',
                                    })}
                                >
                                    Get started
                                    <ArrowRightIcon
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                </Link>
                                <Link
                                    to="/login"
                                    className={buttonVariants({
                                        variant: 'outline',
                                    })}
                                >
                                    Sign in
                                </Link>
                            </div>

                            <div className="text-kraft/45 mt-6 flex items-center gap-2 text-xs">
                                <ShieldCheckIcon
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5"
                                />
                                Private and secure. Your data stays yours.
                            </div>
                        </div>
                    </div>

                    <footer className="px-6 pb-6 text-center">
                        <p className="text-kraft/40 text-xs">
                            Built for real households, real calendars, and
                            real-life chaos.
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
