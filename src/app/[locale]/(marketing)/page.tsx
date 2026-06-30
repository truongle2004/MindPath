import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/libs/I18nNavigation';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Index(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  redirect({ href: '/about', locale });
}
