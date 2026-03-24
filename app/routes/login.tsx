import { useState } from 'react';
import { Link, redirect, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheckIcon } from 'lucide-react';
import { authClient } from '~/lib/auth.client';
import { getUserFromSession } from '~/models/session.server';
import { Alert, AlertDescription, Button, Input as RivetInput } from 'rivet-ui';
import type { Route } from './+types/login';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    if (user) throw redirect('/chat');
    return null;
}

const formSchema = z.object({
    name: z.string().optional(),
    email: z.email({ message: 'Enter a valid email address' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginRoute() {
    const navigate = useNavigate();
    const [isSignIn, setIsSignIn] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    function handleToggle() {
        setIsSignIn((prev) => !prev);
        reset();
        setFormError(null);
    }

    const onSubmit = async (data: FormValues) => {
        setFormError(null);

        if (!isSignIn && !data.name?.trim()) {
            setError('name', { message: 'Name is required' });
            return;
        }

        const callbackURL = `${window.location.origin}/chat`;

        if (isSignIn) {
            await authClient.signIn.email(
                { email: data.email, password: data.password, callbackURL },
                {
                    onSuccess: () => navigate('/chat'),
                    onError: (ctx) =>
                        setFormError(ctx.error.message ?? 'Sign in failed.'),
                },
            );
        } else {
            await authClient.signUp.email(
                {
                    email: data.email,
                    password: data.password,
                    name: data.name!,
                    callbackURL,
                },
                {
                    onSuccess: () => navigate('/chat'),
                    onError: (ctx) =>
                        setFormError(
                            ctx.error.message ?? 'Registration failed.',
                        ),
                },
            );
        }
    };

    return (
        <>
            <title>
                {isSignIn ? 'Sign In' : 'Sign Up'} | Maggie&apos;s Mental Load
            </title>
            <meta
                name="description"
                content={
                    isSignIn
                        ? 'Sign in to continue managing your household.'
                        : 'Create your account and let Maggie help manage your mental load.'
                }
            />

            <div className="bg-canvas flex h-full flex-col overflow-y-auto md:flex-row">
                {/* ── Image / brand panel ── */}
                <div className="relative flex flex-col justify-between overflow-hidden px-8 py-10 md:w-1/2 md:px-12 md:py-14 lg:w-[55%]">
                    {/*
                     * IMAGE PLACEHOLDER
                     * Replace the gradient below with your hero image:
                     *   <img src="/images/auth-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
                     * Keep the overlay div for text readability.
                     */}
                    <div className="from-denim via-denim/85 to-ribbon/70 absolute inset-0 bg-gradient-to-br" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_oklch(72%_0.14_75_/_0.12),_transparent_60%)]" />

                    <div className="relative z-10">
                        <Link
                            to="/"
                            className="font-display text-lg font-semibold text-white/90 transition-opacity hover:opacity-80"
                        >
                            Maggie&apos;s Mental Load
                        </Link>
                    </div>

                    <div className="relative z-10 mt-auto max-w-lg">
                        <p className="font-display hidden text-3xl leading-snug font-medium text-white md:block lg:text-4xl lg:leading-snug">
                            &ldquo;Finally, someone who gets&nbsp;it.&rdquo;
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

                {/* ── Form panel ── */}
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-12">
                        <div className="w-full max-w-md">
                            <div className="text-ribbon mb-6 flex items-center gap-2 text-sm font-medium">
                                <ShieldCheckIcon
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                                Private and secure
                            </div>

                            <h1 className="font-display text-kraft text-2xl font-semibold md:text-3xl">
                                {isSignIn
                                    ? 'Welcome back'
                                    : 'Create your account'}
                            </h1>
                            <p className="text-kraft/60 mt-2">
                                {isSignIn
                                    ? 'Pick up where you left off, Maggie remembers everything.'
                                    : 'Start organizing your household with less mental clutter.'}
                            </p>

                            {formError && (
                                <Alert variant="error" className="mt-6">
                                    <AlertDescription>
                                        {formError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="mt-8 space-y-5"
                            >
                                {!isSignIn && (
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="text-kraft text-sm font-medium"
                                        >
                                            Name
                                        </label>
                                        <RivetInput
                                            id="name"
                                            type="text"
                                            placeholder="What should Maggie call you?"
                                            className="mt-1.5"
                                            variant={
                                                errors.name
                                                    ? 'error'
                                                    : 'default'
                                            }
                                            disabled={isSubmitting}
                                            aria-describedby={
                                                errors.name
                                                    ? 'name-error'
                                                    : undefined
                                            }
                                            {...register('name')}
                                        />
                                        {errors.name && (
                                            <p
                                                id="name-error"
                                                className="text-error mt-1 text-sm"
                                            >
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="text-kraft text-sm font-medium"
                                    >
                                        Email address
                                    </label>
                                    <RivetInput
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="mt-1.5"
                                        variant={
                                            errors.email ? 'error' : 'default'
                                        }
                                        disabled={isSubmitting}
                                        aria-describedby={
                                            errors.email
                                                ? 'email-error'
                                                : undefined
                                        }
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <p
                                            id="email-error"
                                            className="text-error mt-1 text-sm"
                                        >
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="text-kraft text-sm font-medium"
                                    >
                                        Password
                                    </label>
                                    <RivetInput
                                        id="password"
                                        type="password"
                                        placeholder="At least 8 characters"
                                        className="mt-1.5"
                                        variant={
                                            errors.password
                                                ? 'error'
                                                : 'default'
                                        }
                                        disabled={isSubmitting}
                                        aria-describedby={
                                            errors.password
                                                ? 'password-error'
                                                : undefined
                                        }
                                        {...register('password')}
                                    />
                                    {errors.password && (
                                        <p
                                            id="password-error"
                                            className="text-error mt-1 text-sm"
                                        >
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="!mt-8 w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span
                                            role="status"
                                            aria-label="Loading"
                                            className="loading loading-spinner loading-sm"
                                        />
                                    ) : isSignIn ? (
                                        'Sign in'
                                    ) : (
                                        'Create account'
                                    )}
                                </Button>
                            </form>

                            <p className="text-kraft/60 mt-6 text-center text-sm">
                                {isSignIn
                                    ? "Don't have an account?"
                                    : 'Already have an account?'}{' '}
                                <button
                                    type="button"
                                    onClick={handleToggle}
                                    className="text-denim cursor-pointer font-medium hover:underline"
                                >
                                    {isSignIn ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
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
