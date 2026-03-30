import {
    BaseRetriever,
    type BaseMessage,
    type RetrieveOptions,
} from '@voltagent/core';
import { getChildrenByUserId } from '~/models/child.server';
import { getProvidersByUserId } from '~/models/provider.server';
import { getPreferencesByUserId } from '~/models/preference.server';

export class HouseholdManualRetriever extends BaseRetriever {
    constructor() {
        super({
            toolName: 'household_manual_context',
            toolDescription:
                "Inject the user's household manual (children, providers, preferences) as context.",
        });
    }

    async retrieve(
        _input: string | BaseMessage[],
        options: RetrieveOptions,
    ): Promise<string> {
        const { userId } = options;
        if (!userId) return '';

        const [children, providers, preferences] = await Promise.all([
            getChildrenByUserId(userId),
            getProvidersByUserId(userId),
            getPreferencesByUserId(userId),
        ]);

        const sections: string[] = [];

        if (children.length) {
            const lines = children.map((c) => {
                const parts = [`- **${c.name}**`];
                if (c.birthday) {
                    const age = Math.floor(
                        (Date.now() - c.birthday.getTime()) /
                            (365.25 * 24 * 60 * 60 * 1000),
                    );
                    parts.push(`(age ${age})`);
                }
                if (c.allergies) parts.push(`| allergies: ${c.allergies}`);
                if (c.interests) parts.push(`| interests: ${c.interests}`);
                if (c.pediatrician)
                    parts.push(`| pediatrician: ${c.pediatrician}`);
                return parts.join(' ');
            });
            sections.push(`## Children\n${lines.join('\n')}`);
        }

        if (providers.length) {
            const lines = providers.map((p) => {
                const parts = [`- **${p.name}** [${p.category}]`];
                if (p.phone) parts.push(`| ${p.phone}`);
                if (p.email) parts.push(`| ${p.email}`);
                return parts.join(' ');
            });
            sections.push(`## Providers\n${lines.join('\n')}`);
        }

        if (preferences.length) {
            const lines = preferences.map(
                (p) => `- ${p.key}: ${p.value} [${p.category}]`,
            );
            sections.push(`## Preferences\n${lines.join('\n')}`);
        }

        return sections.join('\n\n');
    }
}
