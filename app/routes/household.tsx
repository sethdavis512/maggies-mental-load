import { Outlet } from 'react-router';
import { authMiddleware } from '~/middleware/auth';
import type { Route } from './+types/household';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export default function HouseholdLayout() {
    return <Outlet />;
}
