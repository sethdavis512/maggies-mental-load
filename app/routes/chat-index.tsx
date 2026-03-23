import { SpoolIcon } from 'lucide-react';

export default function ChatIndexRoute() {
    return (
        <div className="border-kraft/12 bg-canvas rounded-box flex grow items-center justify-center border">
            <div className="space-y-3 text-center">
                <SpoolIcon className="text-spool mx-auto h-10 w-10" />
                <p className="font-display text-kraft text-xl">
                    Pick a conversation to continue
                </p>
                <p className="text-kraft/65 text-sm">
                    Or start a new thread for tonight&apos;s planning.
                </p>
                <span className="badge badge-warning badge-outline">
                    You&apos;ve got this
                </span>
            </div>
        </div>
    );
}
