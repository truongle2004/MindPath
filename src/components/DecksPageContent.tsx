'use client';

import { Layers, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { httpJson } from '@/libs/Fetcher';
import { Link } from '@/libs/I18nNavigation';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import {
  createDeckResponseSchema,
  getDecksResponseSchema,
} from '@/modules/flashcard/entities/models/deck.schema';

const deckColors = ['#7F77DD', '#4A90A4', '#6B8F71', '#C17C74', '#D4A056'];
const defaultColor = deckColors[0] ?? '#7F77DD';

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
  const [colorHex, setColorHex] = useState(defaultColor);
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

  function resetForm() {
    setTitle('');
    setDescription('');
    setColorHex(defaultColor);
    setFormError(null);
  }

  function handleDialogOpenChange(open: boolean) {
    setIsCreateOpen(open);
    if (!open) {
      resetForm();
    }
  }

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

      if (!response.ok) {
        throw new Error('Failed to create deck');
      }

      resetForm();
      setIsCreateOpen(false);
      await loadDecks();
    } catch {
      setFormError(t('create_error_message'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'loading') {
    return <p className="text-sm text-muted-foreground">{t('loading_message')}</p>;
  }

  if (status === 'error') {
    return <p className="text-sm text-muted-foreground">{t('error_message')}</p>;
  }

  const isEmpty = decks.length === 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t('page_description')}</p>
        {!isEmpty && (
          <Button
            onClick={() => {
              setIsCreateOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            {t('create_deck_button')}
          </Button>
        )}
      </div>

      {isEmpty ? (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div
              aria-hidden
              className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <Layers />
            </div>
            <CardTitle>{t('empty_title')}</CardTitle>
            <CardDescription className="max-w-sm">{t('empty_description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
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
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-1 size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: deck.colorHex ?? defaultColor }}
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

      <Dialog open={isCreateOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <form className="flex flex-col gap-4" onSubmit={handleCreateDeck}>
            <DialogHeader>
              <DialogTitle>{t('create_dialog_title')}</DialogTitle>
              <DialogDescription>{t('create_dialog_description')}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
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
                  autoFocus
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
                  rows={3}
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
                      className="size-7 rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-105 aria-pressed:ring-2 aria-pressed:ring-ring"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setColorHex(color);
                      }}
                    />
                  ))}
                </div>
              </fieldset>

              {formError ? (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleDialogOpenChange(false);
                }}
                disabled={isSubmitting}
              >
                {t('cancel_button')}
              </Button>
              <Button type="submit" disabled={isSubmitting || title.trim().length === 0}>
                {isSubmitting ? t('creating_button') : t('create_deck_button')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
