import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={<Compass className="h-8 w-8" aria-hidden="true" />}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Back to Dashboard
          </Link>
        }
      />
    </div>
  );
}
