import { setRequestLocale } from 'next-intl/server';
import { DemoBanner } from '@/components/DemoBanner';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <DemoBanner />
      <div className="py-5 text-xl [&_p]:my-6">{props.children}</div>
    </>
  );
}
