'use client';

import { UserProfile } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import { UserProfileOverlay } from '@/components/UserProfileOverlay';
import { useRouter } from '@/lib/I18nNavigation';

export function UserProfilePageContent(props: { profilePath: string }) {
  const router = useRouter();

  return (
    <UserProfileOverlay
      onClose={() => {
        router.push('/dashboard');
      }}
    >
      <UserProfile path={props.profilePath} appearance={{ theme: shadcn }} />
    </UserProfileOverlay>
  );
}
