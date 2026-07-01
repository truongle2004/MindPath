import { PricingTable } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';

export function PricingTableSection() {
  return (
    <PricingTable
      fallback={<Skeleton className="h-64 w-full rounded-xl" />}
      newSubscriptionRedirectUrl="/dashboard"
    />
  );
}
