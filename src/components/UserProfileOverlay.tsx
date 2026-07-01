'use client';

import { UserProfile } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/libs/I18nNavigation';

export function UserProfileOverlay(props: { profilePath: string }) {
  const t = useTranslations('UserProfilePage');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/70 backdrop-blur-sm">
      <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link href="/dashboard">
          <ArrowLeft />
          {t('go_back')}
        </Link>
      </Button>
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <UserProfile path={props.profilePath} />
        </div>
      </div>
    </div>
  );
}
