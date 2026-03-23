import { Container } from '~/components/Container';
import { Link } from 'react-router';
import {
    ClipboardListIcon,
    CalendarClockIcon,
    CookingPotIcon,
    CircleCheckBigIcon,
} from 'lucide-react';

export default function Home() {
    return (
        <>
            <title>Home | maggies-mental-load</title>
            <meta
                name="description"
                content="A warm, action-ready home command center that helps working moms reduce mental load and keep household life moving."
            />
            <Container className="px-1 py-2 md:px-2 md:py-3">
                <header className="border-kraft/10 mb-6 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <span className="badge badge-info badge-outline">
                            Welcome back
                        </span>
                        <h1 className="font-display text-kraft text-3xl font-semibold">
                            Your household command center
                        </h1>
                        <p className="text-kraft/65 text-sm">
                            Pick one small win first. Momentum beats perfection.
                        </p>
                    </div>
                    <Link to="/chat" className="btn btn-primary btn-sm w-fit">
                        Open Maggie
                    </Link>
                </header>

                <section className="mt-6 grid gap-4 md:grid-cols-12">
                    <section className="border-kraft/12 bg-surface rounded-box border md:col-span-8">
                        <div className="p-6 pb-3">
                            <h2 className="font-display text-[1.45rem]">
                                Tonight&apos;s quick plan
                            </h2>
                        </div>
                        <div className="px-6 pb-6">
                            <ul className="text-kraft/75 space-y-3 text-sm">
                                <li className="flex items-start gap-2.5">
                                    <CircleCheckBigIcon className="text-ribbon mt-0.5 h-4 w-4" />
                                    Capture what&apos;s still swirling in your
                                    head.
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CircleCheckBigIcon className="text-ribbon mt-0.5 h-4 w-4" />
                                    Pick one dinner + one tomorrow must-do.
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CircleCheckBigIcon className="text-ribbon mt-0.5 h-4 w-4" />
                                    Let Maggie turn it into clear next actions.
                                </li>
                            </ul>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <Link
                                    to="/chat"
                                    className="btn btn-primary btn-sm"
                                >
                                    Start a brain dump
                                </Link>
                                <Link to="/notes" className="btn btn-sm">
                                    Review saved notes
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="border-kraft/12 bg-surface rounded-box border p-6 md:col-span-4">
                        <h3 className="mb-2 text-base font-semibold">
                            This week focus
                        </h3>
                        <div className="text-kraft/70 space-y-2 text-sm">
                            <p>Small consistent wins create real relief.</p>
                            <span className="badge badge-outline">
                                Progress over pressure
                            </span>
                        </div>
                    </section>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <section className="border-kraft/12 bg-surface rounded-box border p-6">
                        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
                            <ClipboardListIcon className="text-spool h-4 w-4" />
                            Mental load capture
                        </h3>
                        <p className="text-kraft/70 text-sm">
                            Put messy thoughts in one place, then convert them
                            into calm next steps.
                        </p>
                    </section>
                    <section className="border-kraft/12 bg-surface rounded-box border p-6">
                        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
                            <CookingPotIcon className="text-spool h-4 w-4" />
                            Meals and grocery
                        </h3>
                        <p className="text-kraft/70 text-sm">
                            Keep dinner decisions simple and your shopping list
                            synced to real life.
                        </p>
                    </section>
                    <section className="border-kraft/12 bg-surface rounded-box border p-6 sm:col-span-2 xl:col-span-1">
                        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
                            <CalendarClockIcon className="text-spool h-4 w-4" />
                            Scheduling and logistics
                        </h3>
                        <p className="text-kraft/70 text-sm">
                            Track deadlines, school details, and handoffs
                            without carrying it all in your head.
                        </p>
                    </section>
                </section>

                <p className="text-kraft/65 mt-6 text-sm">
                    You don&apos;t need to solve everything in one sitting. Pick
                    one next action, and keep going from there.
                </p>
            </Container>
        </>
    );
}
