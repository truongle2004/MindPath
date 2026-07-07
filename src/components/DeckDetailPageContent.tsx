'use client';

import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Link, useRouter } from '@/libs/I18nNavigation';
import type { Card as Flashcard } from '@/modules/flashcard/entities/models/card';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { GetDeckResponse } from '@/modules/flashcard/interface-adapters/controllers/get-deck.controller.interface';

type DeckDetailPageContentProps = {
  deckId: string;
};

type CardFormMode = 'create' | 'edit';

/**
 * Checks whether a value matches the deck detail response shape.
 * @param value The parsed JSON body.
 * @returns True when the body contains deck and cards fields.
 */
function isDeckResponse(value: unknown): value is GetDeckResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'deck' in value && 'cards' in value;
}

/**
 * Client UI for managing cards within a deck.
 * @param props The deck id from the route.
 * @returns The deck detail page content.
 */
export function DeckDetailPageContent(props: DeckDetailPageContentProps) {
  const t = useTranslations('DeckDetailPage');
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isCardSheetOpen, setIsCardSheetOpen] = useState(false);
  const [cardFormMode, setCardFormMode] = useState<CardFormMode>('create');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteDeck, setConfirmDeleteDeck] = useState(false);
  const [confirmDeleteCardId, setConfirmDeleteCardId] = useState<string | null>(null);

  async function loadDeck() {
    try {
      const response = await fetch(`/api/decks/${props.deckId}`);

      if (!response.ok) {
        throw new Error('Failed to load deck');
      }

      const body: unknown = await response.json();

      if (!isDeckResponse(body)) {
        throw new Error('Invalid deck response');
      }

      setDeck(body.deck);
      setCards(body.cards);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    void loadDeck();
    // loadDeck is stable for a given deckId during this page visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when deckId changes only
  }, [props.deckId]);

  function openCreateCardSheet() {
    setCardFormMode('create');
    setEditingCardId(null);
    setFront('');
    setBack('');
    setFormError(null);
    setIsCardSheetOpen(true);
  }

  function openEditCardSheet(card: Flashcard) {
    setCardFormMode('edit');
    setEditingCardId(card.id);
    setFront(card.front);
    setBack(card.back);
    setFormError(null);
    setIsCardSheetOpen(true);
  }

  async function handleSubmitCard(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload = { front: front.trim(), back: back.trim() };

    try {
      const response =
        cardFormMode === 'create'
          ? await fetch(`/api/decks/${props.deckId}/cards`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/decks/${props.deckId}/cards/${editingCardId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

      if (!response.ok) {
        throw new Error('Failed to save card');
      }

      setIsCardSheetOpen(false);
      await loadDeck();
    } catch {
      setFormError(t('save_error_message'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      const response = await fetch(`/api/decks/${props.deckId}/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      setConfirmDeleteCardId(null);
      await loadDeck();
    } catch {
      setFormError(t('delete_error_message'));
    }
  }

  async function handleDeleteDeck() {
    try {
      const response = await fetch(`/api/decks/${props.deckId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deck');
      }

      router.push('/dashboard/decks');
    } catch {
      setFormError(t('delete_error_message'));
    }
  }

  if (status === 'loading') {
    return <p className="text-muted-foreground">{t('loading_message')}</p>;
  }

  if (status === 'error' || !deck) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t('error_message')}</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/decks">
            <ArrowLeft data-icon="inline-start" />
            {t('back_to_decks')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/dashboard/decks">
            <ArrowLeft data-icon="inline-start" />
            {t('back_to_decks')}
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden
              className="mt-1.5 size-3 shrink-0 rounded-full"
              style={{ backgroundColor: deck.colorHex ?? '#7F77DD' }}
            />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight">{deck.title}</h2>
              {deck.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{deck.description}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={openCreateCardSheet}>
              <Plus data-icon="inline-start" />
              {t('add_card_button')}
            </Button>
            {confirmDeleteDeck ? (
              <>
                <span className="text-sm text-muted-foreground">{t('delete_deck_confirm')}</span>
                <Button
                  variant="destructive"
                  onClick={() => {
                    void handleDeleteDeck();
                  }}
                >
                  {t('confirm_delete_button')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmDeleteDeck(false);
                  }}
                >
                  {t('cancel_delete_button')}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmDeleteDeck(true);
                }}
              >
                <Trash2 data-icon="inline-start" />
                {t('delete_deck_button')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      {cards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('empty_cards_title')}</CardTitle>
            <CardDescription>{t('empty_cards_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openCreateCardSheet}>
              <Plus data-icon="inline-start" />
              {t('add_card_button')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className="overflow-hidden rounded-lg border border-border"
          aria-label={t('cards_list_label')}
        >
          <div className="grid grid-cols-[1fr_1px_1fr_auto] bg-muted/50 px-4 py-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('front_label')}
            </span>
            <span />
            <span className="pl-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('back_label')}
            </span>
            <span />
          </div>
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`grid grid-cols-[1fr_1px_1fr_auto] items-start${index > 0 ? ' border-t border-border' : ''}`}
            >
              <p className="px-4 py-3 text-sm whitespace-pre-wrap">{card.front}</p>
              <div className="self-stretch bg-border" />
              <p className="px-4 py-3 text-sm whitespace-pre-wrap text-muted-foreground">
                {card.back}
              </p>
              <div className="flex items-center gap-1 px-2 py-2">
                {confirmDeleteCardId === card.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {t('delete_card_confirm')}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        void handleDeleteCard(card.id);
                      }}
                    >
                      {t('confirm_delete_button')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConfirmDeleteCardId(null);
                      }}
                    >
                      {t('cancel_delete_button')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('edit_card_button')}
                      onClick={() => {
                        openEditCardSheet(card);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('delete_card_button')}
                      onClick={() => {
                        setConfirmDeleteCardId(card.id);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={isCardSheetOpen} onOpenChange={setIsCardSheetOpen}>
        <SheetContent side="right">
          <form className="flex h-full flex-col" onSubmit={handleSubmitCard}>
            <SheetHeader>
              <SheetTitle>
                {cardFormMode === 'create' ? t('create_card_title') : t('edit_card_title')}
              </SheetTitle>
              <SheetDescription>{t('card_form_description')}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 px-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="card-front">{t('front_label')}</Label>
                <Textarea
                  id="card-front"
                  value={front}
                  onChange={(event) => {
                    setFront(event.target.value);
                  }}
                  placeholder={t('front_placeholder')}
                  required
                  maxLength={2000}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="card-back">{t('back_label')}</Label>
                <Textarea
                  id="card-back"
                  value={back}
                  onChange={(event) => {
                    setBack(event.target.value);
                  }}
                  placeholder={t('back_placeholder')}
                  required
                  maxLength={2000}
                />
              </div>

              {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            </div>

            <SheetFooter>
              <Button
                type="submit"
                disabled={isSubmitting || front.trim().length === 0 || back.trim().length === 0}
              >
                {cardFormMode === 'create' ? t('add_card_button') : t('save_card_button')}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
