import invariant from 'tiny-invariant';
import { Container } from '~/components/Container';
import type { Route } from './+types/household-index';
import { getUserFromSession } from '~/models/session.server';
import { getChildrenByUserId } from '~/models/child.server';
import { getProvidersByUserId } from '~/models/provider.server';
import { getPreferencesByUserId } from '~/models/preference.server';
import { getFamilyMembersByUserId } from '~/models/family-member.server';
import { getLoyaltyProgramsByUserId } from '~/models/loyalty-program.server';
import {
    BabyIcon,
    CreditCardIcon,
    HeartIcon,
    SettingsIcon,
    WrenchIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import {
    Badge,
    buttonVariants,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'rivet-ui';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const [children, providers, preferences, familyMembers, loyaltyPrograms] =
        await Promise.all([
            getChildrenByUserId(user.id),
            getProvidersByUserId(user.id),
            getPreferencesByUserId(user.id),
            getFamilyMembersByUserId(user.id),
            getLoyaltyProgramsByUserId(user.id),
        ]);

    return {
        children: children.slice(0, 3),
        childrenCount: children.length,
        providers: providers.slice(0, 3),
        providersCount: providers.length,
        preferences: preferences.slice(0, 3),
        preferencesCount: preferences.length,
        familyMembers: familyMembers.slice(0, 3),
        familyMembersCount: familyMembers.length,
        loyaltyPrograms: loyaltyPrograms.slice(0, 3),
        loyaltyProgramsCount: loyaltyPrograms.length,
    };
}

function EmptySection() {
    return (
        <p className="text-kraft/55 text-sm">
            Nothing here yet.{' '}
            <Link
                to="/chat"
                className="text-denim underline-offset-2 hover:underline"
            >
                Chat with Maggie
            </Link>{' '}
            to start building your household manual.
        </p>
    );
}

export default function HouseholdIndexRoute({
    loaderData,
}: Route.ComponentProps) {
    const {
        children,
        childrenCount,
        providers,
        providersCount,
        preferences,
        preferencesCount,
        familyMembers,
        familyMembersCount,
        loyaltyPrograms,
        loyaltyProgramsCount,
    } = loaderData;

    const totalItems =
        childrenCount +
        providersCount +
        preferencesCount +
        familyMembersCount +
        loyaltyProgramsCount;

    return (
        <>
            <title>Household Manual</title>
            <meta
                name="description"
                content="Everything Maggie knows about your household in one organized place."
            />
            <div className="h-full overflow-y-auto">
                <Container className="p-2 md:p-4">
                    <header className="border-kraft/10 mb-5 border-b pb-6">
                        <Badge variant="mustard" className="mb-2">
                            Your family profile
                        </Badge>
                        <h1 className="font-display text-kraft text-3xl font-semibold">
                            Household Manual
                        </h1>
                        <p className="text-kraft/65 text-sm">
                            {totalItems > 0
                                ? `${totalItems} items across your family profile.`
                                : 'Start chatting with Maggie to build your household profile.'}
                        </p>
                    </header>

                    <div className="space-y-6">
                        {/* Family section: Children + Family Members */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <HeartIcon className="text-spool h-5 w-5" />
                                        Family
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {childrenCount + familyMembersCount >
                                            0 && (
                                            <Badge variant="denim">
                                                {childrenCount +
                                                    familyMembersCount}
                                            </Badge>
                                        )}
                                        <Link
                                            to="/household/children"
                                            className={buttonVariants({
                                                variant: 'outline',
                                                size: 'sm',
                                            })}
                                        >
                                            View all
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {childrenCount + familyMembersCount > 0 ? (
                                    <ul className="space-y-2">
                                        {children.map((child) => (
                                            <li
                                                key={child.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <BabyIcon className="text-ribbon h-4 w-4 shrink-0" />
                                                <span className="font-medium">
                                                    {child.name}
                                                </span>
                                                {child.birthday && (
                                                    <span className="text-kraft/55">
                                                        {formatAge(
                                                            child.birthday,
                                                        )}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                        {familyMembers.map((member) => (
                                            <li
                                                key={member.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <HeartIcon className="text-ribbon h-4 w-4 shrink-0" />
                                                <span className="font-medium">
                                                    {member.name}
                                                </span>
                                                <span className="text-kraft/55">
                                                    {member.relationship}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptySection />
                                )}
                            </CardContent>
                        </Card>

                        {/* Providers */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <WrenchIcon className="text-spool h-5 w-5" />
                                        Providers
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {providersCount > 0 && (
                                            <Badge variant="denim">
                                                {providersCount}
                                            </Badge>
                                        )}
                                        <Link
                                            to="/household/providers"
                                            className={buttonVariants({
                                                variant: 'outline',
                                                size: 'sm',
                                            })}
                                        >
                                            View all
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {providersCount > 0 ? (
                                    <ul className="space-y-2">
                                        {providers.map((provider) => (
                                            <li
                                                key={provider.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <WrenchIcon className="text-kraft/40 h-4 w-4 shrink-0" />
                                                <span className="font-medium">
                                                    {provider.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {formatCategory(
                                                        provider.category,
                                                    )}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptySection />
                                )}
                            </CardContent>
                        </Card>

                        {/* Preferences */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <SettingsIcon className="text-spool h-5 w-5" />
                                        Preferences
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {preferencesCount > 0 && (
                                            <Badge variant="denim">
                                                {preferencesCount}
                                            </Badge>
                                        )}
                                        <Link
                                            to="/household/preferences"
                                            className={buttonVariants({
                                                variant: 'outline',
                                                size: 'sm',
                                            })}
                                        >
                                            View all
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {preferencesCount > 0 ? (
                                    <ul className="space-y-2">
                                        {preferences.map((pref) => (
                                            <li
                                                key={pref.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {pref.category}
                                                </Badge>
                                                <span className="font-medium">
                                                    {pref.key}
                                                </span>
                                                <span className="text-kraft/55">
                                                    {pref.value}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptySection />
                                )}
                            </CardContent>
                        </Card>

                        {/* Loyalty Programs */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCardIcon className="text-spool h-5 w-5" />
                                        Loyalty Programs
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {loyaltyProgramsCount > 0 && (
                                            <Badge variant="denim">
                                                {loyaltyProgramsCount}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loyaltyProgramsCount > 0 ? (
                                    <ul className="space-y-2">
                                        {loyaltyPrograms.map((program) => (
                                            <li
                                                key={program.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <CreditCardIcon className="text-kraft/40 h-4 w-4 shrink-0" />
                                                <span className="font-medium">
                                                    {program.programName}
                                                </span>
                                                {program.brand && (
                                                    <span className="text-kraft/55">
                                                        {program.brand}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptySection />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </Container>
            </div>
        </>
    );
}

function formatAge(birthday: Date | string): string {
    const birth = new Date(birthday);
    const now = new Date();
    const months =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());
    if (months < 12) {
        return `${months}mo`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
}

function formatCategory(category: string): string {
    return category
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
