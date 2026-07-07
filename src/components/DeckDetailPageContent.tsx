'use client';

import { ArrowLeft, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
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
  const [confirmDeleteDeck, setConfirmDeleteDeck] = useState(false);
  const [confirmDeleteCardId, setConfirmDeleteCardId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Inline create state
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [inlineFront, setInlineFront] = useState('');
  const [inlineBack, setInlineBack] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [inlineSubmitting, setInlineSubmitting] = useState(false);
  const inlineFrontRef = useRef<HTMLInputElement>(null);

  // Edit sheet state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  function openAddCard() {
    setInlineFront('');
    setInlineBack('');
    setInlineError(null);
    setIsAddingCard(true);
    setTimeout(() => {
      inlineFrontRef.current?.focus();
    }, 0);
  }

  function cancelAddCard() {
    setIsAddingCard(false);
    setInlineFront('');
    setInlineBack('');
    setInlineError(null);
  }

  async function handleCreateCard(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setInlineError(null);
    setInlineSubmitting(true);

    try {
      const response = await fetch(`/api/decks/${props.deckId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front: inlineFront.trim(), back: inlineBack.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to save card');
      }

      setInlineFront('');
      setInlineBack('');
      setIsAddingCard(false);
      await loadDeck();
    } catch {
      setInlineError(t('save_error_message'));
    } finally {
      setInlineSubmitting(false);
    }
  }

  function openEditSheet(card: Flashcard) {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditError(null);
    setIsEditSheetOpen(true);
  }

  async function handleUpdateCard(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditError(null);
    setEditSubmitting(true);

    try {
      const response = await fetch(`/api/decks/${props.deckId}/cards/${editingCardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front: editFront.trim(), back: editBack.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to save card');
      }

      setIsEditSheetOpen(false);
      await loadDeck();
    } catch {
      setEditError(t('save_error_message'));
    } finally {
      setEditSubmitting(false);
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
      setDeleteError(t('delete_error_message'));
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
      setDeleteError(t('delete_error_message'));
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

  const showTable = cards.length > 0 || isAddingCard;

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

      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}

      {showTable ? (
        <div className="flex flex-col gap-2">
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
                <p className="px-4 py-3 text-base font-bold whitespace-pre-wrap">{card.front}</p>
                <div className="self-stretch bg-border" />
                <p className="px-4 py-3 text-base whitespace-pre-wrap">{card.back}</p>
                <div className="flex items-center gap-1 px-2 py-1.5">
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
                          openEditSheet(card);
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

            {isAddingCard && (
              <form
                className="grid grid-cols-[1fr_1px_1fr_auto] items-center border-t border-border bg-muted/20"
                onSubmit={handleCreateCard}
              >
                <input
                  ref={inlineFrontRef}
                  aria-label={t('front_label')}
                  className="w-full bg-transparent px-4 py-3 text-base font-bold outline-none placeholder:font-normal placeholder:text-muted-foreground/60"
                  placeholder={t('front_placeholder')}
                  value={inlineFront}
                  onChange={(e) => {
                    setInlineFront(e.target.value);
                  }}
                  maxLength={2000}
                  required
                />
                <div className="self-stretch bg-border" />
                <input
                  aria-label={t('back_label')}
                  className="w-full bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60"
                  placeholder={t('back_placeholder')}
                  value={inlineBack}
                  onChange={(e) => {
                    setInlineBack(e.target.value);
                  }}
                  maxLength={2000}
                  required
                />
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('save_card_button')}
                    disabled={
                      inlineSubmitting ||
                      inlineFront.trim().length === 0 ||
                      inlineBack.trim().length === 0
                    }
                  >
                    <Check />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('cancel_delete_button')}
                    onClick={cancelAddCard}
                  >
                    <X />
                  </Button>
                </div>
              </form>
            )}
          </div>

          {inlineError ? <p className="text-sm text-destructive">{inlineError}</p> : null}

          {!isAddingCard && (
            <button
              type="button"
              className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={openAddCard}
            >
              <Plus className="size-4" />
              {t('add_card_button')}
            </button>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('empty_cards_title')}</CardTitle>
            <CardDescription>{t('empty_cards_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={openAddCard}
            >
              <Plus className="size-4" />
              {t('add_card_button')}
            </button>
          </CardContent>
        </Card>
      )}

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right">
          <form className="flex h-full flex-col" onSubmit={handleUpdateCard}>
            <SheetHeader>
              <SheetTitle>{t('edit_card_title')}</SheetTitle>
              <SheetDescription>{t('card_form_description')}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 px-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-card-front">{t('front_label')}</Label>
                <Textarea
                  id="edit-card-front"
                  value={editFront}
                  onChange={(event) => {
                    setEditFront(event.target.value);
                  }}
                  placeholder={t('front_placeholder')}
                  required
                  maxLength={2000}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-card-back">{t('back_label')}</Label>
                <Textarea
                  id="edit-card-back"
                  value={editBack}
                  onChange={(event) => {
                    setEditBack(event.target.value);
                  }}
                  placeholder={t('back_placeholder')}
                  required
                  maxLength={2000}
                />
              </div>

              {editError ? <p className="text-sm text-destructive">{editError}</p> : null}
            </div>

            <SheetFooter>
              <Button
                type="submit"
                disabled={
                  editSubmitting || editFront.trim().length === 0 || editBack.trim().length === 0
                }
              >
                {t('save_card_button')}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
