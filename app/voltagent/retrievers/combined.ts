import {
    BaseRetriever,
    type BaseMessage,
    type RetrieveOptions,
} from '@voltagent/core';

export class CombinedRetriever extends BaseRetriever {
    private retrievers: BaseRetriever[];

    constructor(retrievers: BaseRetriever[]) {
        super({
            toolName: 'combined_context',
            toolDescription: 'Search notes and tasks for relevant context.',
        });
        this.retrievers = retrievers;
    }

    async retrieve(
        input: string | BaseMessage[],
        options: RetrieveOptions,
    ): Promise<string> {
        const results = await Promise.all(
            this.retrievers.map((r) => r.retrieve(input, options)),
        );

        return results.filter(Boolean).join('\n\n');
    }
}
