import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DeckDetailPageContent } from '@/components/DeckDetailPageContent';

type DeckDetailPageProps = {
  params: Promise<{ locale: string; deckId: string }>;
};

export async function generateMetadata(props: DeckDetailPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DeckDetailPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DeckDetailPage(props: DeckDetailPageProps) {
  const { locale, deckId } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DeckDetailPageContent deckId={deckId} />
    </div>
  );
}
