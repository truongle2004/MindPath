'use client';

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/libs/I18nNavigation';

const localeMessageKeys = {
  en: 'language_en',
  vi: 'language_vi',
} as const satisfies Record<string, 'language_en' | 'language_vi'>;

/**
 * Dropdown control for switching the active locale while preserving the current path.
 * @returns The language switcher button and menu.
 */
export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('toggle_label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(nextLocale) => {
            router.replace(pathname, { locale: nextLocale });
          }}
        >
          {Object.entries(localeMessageKeys).map(([option, messageKey]) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {t(messageKey)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
