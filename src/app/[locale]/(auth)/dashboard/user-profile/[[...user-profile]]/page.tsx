import { setRequestLocale } from 'next-intl/server';
import { UserProfileOverlay } from '@/components/UserProfileOverlay';
import { getI18nPath } from '@/utils/Helpers';

type UserProfilePageProps = {
  params: Promise<{ locale: string; 'user-profile'?: string[] }>;
};

export default async function UserProfilePage(props: UserProfilePageProps) {
  const { locale, 'user-profile': userProfileSegments } = await props.params;
  setRequestLocale(locale);

  const profileSubPath = userProfileSegments?.length ? `/${userProfileSegments.join('/')}` : '';

  return (
    <UserProfileOverlay
      profilePath={getI18nPath(`/dashboard/user-profile${profileSubPath}`, locale)}
    />
  );
}
