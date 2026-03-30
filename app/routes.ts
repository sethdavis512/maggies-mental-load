import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route,
} from '@react-router/dev/routes';

export default [
    index('routes/landing.tsx'),
    route('/login', 'routes/login.tsx'),
    route('/logout', 'routes/logout.tsx'),
    route('/healthcheck', 'routes/healthcheck.ts'),
    ...prefix('/api', [
        route('/auth/*', 'routes/api-auth.ts'),
        route('/chat', 'routes/api-chat.ts'),
    ]),
    layout('routes/app-layout.tsx', [
        route('/dashboard', 'routes/home.tsx'),
        route('/chat', 'routes/chat.tsx', [
            index('routes/chat-index.tsx'),
            route(':threadId', 'routes/thread.tsx'),
        ]),
        route('/tasks', 'routes/tasks.tsx'),
        route('/notes', 'routes/notes.tsx'),
        route('/household', 'routes/household.tsx', [
            index('routes/household-index.tsx'),
            route('children', 'routes/household-children.tsx'),
            route('providers', 'routes/household-providers.tsx'),
            route('preferences', 'routes/household-preferences.tsx'),
        ]),
        route('/profile', 'routes/profile.tsx'),
    ]),
] satisfies RouteConfig;
