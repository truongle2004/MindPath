import { setRequestLocale } from 'next-intl/server';
import { UserProfilePageContent } from '@/components/UserProfilePageContent';
import { getI18nPath } from '@/utils/Helpers';

export default async function UserProfilePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <UserProfilePageContent profilePath={getI18nPath('/dashboard/user-profile', locale)} />;
}
