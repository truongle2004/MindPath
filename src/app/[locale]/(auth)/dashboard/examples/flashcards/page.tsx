import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { FlashcardItem } from '@/components/Flashcards';
import { Flashcards } from '@/components/Flashcards';

type FlashcardsExamplePageProps = {
  params: Promise<{ locale: string }>;
};

const EXAMPLE_CARDS: FlashcardItem[] = [
  {
    id: '1',
    question: 'What is React?',
    answer: 'A JavaScript library for building user interfaces out of components.',
  },
  {
    id: '2',
    question: 'What is a Hook?',
    answer: 'A function that lets you use state and other React features in function components.',
  },
  {
    id: '3',
    question: 'What is JSX?',
    answer: 'A syntax extension for JavaScript that lets you write HTML-like markup inside JS.',
  },
  {
    id: '4',
    question: 'What is the Virtual DOM?',
    answer: 'An in-memory representation of the real DOM used to compute minimal updates.',
  },
  {
    id: '5',
    question: 'What is a Server Component?',
    answer: 'A component that renders on the server and sends no JS to the client by default.',
  },
  {
    id: '6',
    question: 'What is Next.js?',
    answer: 'A React framework providing routing, rendering, and tooling out of the box.',
  },
];

export async function generateMetadata(props: FlashcardsExamplePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'FlashcardsExamplePage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function FlashcardsExamplePage(props: FlashcardsExamplePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('FlashcardsExamplePage');

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('page_title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('page_description')}</p>
      </div>

      <Flashcards cards={EXAMPLE_CARDS} className="min-h-0 flex-1" />
    </div>
  );
}
