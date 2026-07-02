'use client';

import { UserProfile } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { UserProfileSection } from '@/hooks/useUserProfileOverlay';

const profileStartPaths: Record<UserProfileSection, string | undefined> = {
  account: undefined,
  billing: '/billing',
  security: '/security',
};

export function UserProfileOverlay(props: { section: UserProfileSection; onClose: () => void }) {
  const t = useTranslations('UserProfilePage');
  const startPath = profileStartPaths[props.section];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/70 backdrop-blur-sm">
      <Button variant="ghost" className="absolute top-4 left-4" onClick={props.onClose}>
        <ArrowLeft />
        {t('go_back')}
      </Button>
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <UserProfile
            key={props.section}
            routing="hash"
            appearance={{ theme: shadcn }}
            {...(startPath ? { __experimental_startPath: startPath } : {})}
          />
        </div>
      </div>
    </div>
  );
}
