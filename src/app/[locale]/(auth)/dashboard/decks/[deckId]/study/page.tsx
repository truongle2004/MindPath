import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StudyPageContent } from '@/components/StudyPageContent';

type StudyPageProps = {
  params: Promise<{ locale: string; deckId: string }>;
};

export async function generateMetadata(props: StudyPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'StudyPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function StudyPage(props: StudyPageProps) {
  const { locale, deckId } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StudyPageContent deckId={deckId} />
    </div>
  );
}
