'use client';

import { Layers, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { httpJson } from '@/libs/Fetcher';
import { Link } from '@/libs/I18nNavigation';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import {
  createDeckResponseSchema,
  getDecksResponseSchema,
} from '@/modules/flashcard/entities/models/deck.schema';

const deckColors = ['#7F77DD', '#4A90A4', '#6B8F71', '#C17C74', '#D4A056'];

/**
 * Client UI for listing and creating flashcard decks.
 * @returns The decks page content.
 */
export function DecksPageContent() {
  const t = useTranslations('DecksPage');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [colorHex, setColorHex] = useState(deckColors[0] ?? '#7F77DD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadDecks() {
    try {
      const { decks: loaded } = await httpJson('/api/decks', {
        schema: getDecksResponseSchema,
      });

      setDecks(loaded);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    void loadDecks();
  }, []);

  async function handleCreateDeck(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await httpJson('/api/decks', {
        method: 'POST',
        schema: createDeckResponseSchema,
        body: {
          title,
          description: description.trim() || null,
          colorHex,
        },
      });

      setTitle('');
      setDescription('');
      setColorHex(deckColors[0] ?? '#7F77DD');
      setIsCreateOpen(false);
      await loadDecks();
    } catch {
      setFormError(t('create_error_message'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'loading') {
    return <p className="text-muted-foreground">{t('loading_message')}</p>;
  }

  if (status === 'error') {
    return <p className="text-muted-foreground">{t('error_message')}</p>;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t('page_description')}</p>
        <Button
          onClick={() => {
            setIsCreateOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          {t('create_deck_button')}
        </Button>
      </div>

      {decks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('empty_title')}</CardTitle>
            <CardDescription>{t('empty_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setIsCreateOpen(true);
              }}
            >
              <Plus data-icon="inline-start" />
              {t('create_deck_button')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={t('list_label')}>
          {decks.map((deck) => (
            <li key={deck.id}>
              <Link href={`/dashboard/decks/${deck.id}`} className="block h-full">
                <Card className="h-full transition-colors hover:bg-muted/30">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: deck.colorHex ?? '#7F77DD' }}
                      />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate">{deck.title}</CardTitle>
                        {deck.description ? (
                          <CardDescription className="line-clamp-2">
                            {deck.description}
                          </CardDescription>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Layers />
                      {t('card_count', { count: deck.cardCount ?? 0 })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right">
          <form className="flex h-full flex-col" onSubmit={handleCreateDeck}>
            <SheetHeader>
              <SheetTitle>{t('create_sheet_title')}</SheetTitle>
              <SheetDescription>{t('create_sheet_description')}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 px-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="deck-title">{t('title_label')}</Label>
                <Input
                  id="deck-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                  }}
                  placeholder={t('title_placeholder')}
                  required
                  maxLength={100}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="deck-description">{t('description_label')}</Label>
                <Textarea
                  id="deck-description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                  }}
                  placeholder={t('description_placeholder')}
                  maxLength={500}
                />
              </div>

              <fieldset className="flex flex-col gap-2 border-0 p-0">
                <legend className="text-sm font-medium text-foreground">{t('color_label')}</legend>
                <div className="flex flex-wrap gap-2">
                  {deckColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={t('color_option_label', { color })}
                      aria-pressed={colorHex === color}
                      className="size-8 rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-105 aria-pressed:ring-2 aria-pressed:ring-ring"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setColorHex(color);
                      }}
                    />
                  ))}
                </div>
              </fieldset>

              {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            </div>

            <SheetFooter>
              <Button type="submit" disabled={isSubmitting || title.trim().length === 0}>
                {t('create_deck_button')}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
