'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function UserProfileOverlay(props: { onClose: () => void; children: React.ReactNode }) {
  const t = useTranslations('UserProfilePage');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/70 backdrop-blur-sm">
      <Button variant="ghost" className="absolute top-4 left-4" onClick={props.onClose}>
        <ArrowLeft />
        {t('go_back')}
      </Button>
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="w-full max-w-4xl">{props.children}</div>
      </div>
    </div>
  );
}
