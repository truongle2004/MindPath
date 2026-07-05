import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TodosPageContent } from '@/components/TodosPageContent';

type TodosPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: TodosPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'TodosPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function TodosPage(props: TodosPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('TodosPage');

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-semibold tracking-tight">{t('page_title')}</h1>
      <TodosPageContent />
    </div>
  );
}
