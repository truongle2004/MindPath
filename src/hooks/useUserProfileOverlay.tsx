'use client';

import { useLocale } from 'next-intl';
import { getI18nPath } from '@/lib/Helpers';
import { useRouter } from '@/lib/I18nNavigation';

export type UserProfileSection = 'account' | 'billing' | 'security';

const profileSectionPaths: Record<UserProfileSection, string> = {
  account: '/dashboard/user-profile',
  billing: '/dashboard/user-profile/billing',
  security: '/dashboard/user-profile/security',
};

/** Navigates to the user profile route for the given section.
 * @returns Navigation helpers for opening user profile sections.
 */
export function useUserProfileOverlay() {
  const router = useRouter();
  const locale = useLocale();

  const openUserProfile = (section: UserProfileSection = 'account') => {
    router.push(getI18nPath(profileSectionPaths[section], locale));
  };

  return { openUserProfile };
}
