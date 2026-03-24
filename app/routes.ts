import {
    type RouteConfig,
    index,
    layout,
    prefix,
    route,
} from '@react-router/dev/routes';

export default [
    route('/login', 'routes/login.tsx'),
    route('/logout', 'routes/logout.tsx'),
    route('/healthcheck', 'routes/healthcheck.ts'),
    ...prefix('/api', [
        route('/auth/*', 'routes/api-auth.ts'),
        route('/chat', 'routes/api-chat.ts'),
    ]),
    layout('routes/app-layout.tsx', [
        index('routes/home.tsx'),
        route('/chat', 'routes/chat.tsx', [
            index('routes/chat-index.tsx'),
            route(':threadId', 'routes/thread.tsx'),
        ]),
        route('/notes', 'routes/notes.tsx'),
        route('/profile', 'routes/profile.tsx'),
    ]),
] satisfies RouteConfig;
