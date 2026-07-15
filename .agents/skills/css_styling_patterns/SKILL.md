---
name: css_styling_patterns
description: Use this skill whenever writing or reviewing styling code in any project — plain CSS, CSS Modules, Tailwind utility classes, CSS-in-JS (styled-components, emotion), or inline styles. Trigger proactively whenever generating or editing markup with classes/styles, not just when asked to "review styles." Prevents cargo-cult/defensive CSS: properties added "just in case" without a diagnosed problem (min-width: 0, overflow: hidden, !important, arbitrary z-index bumps, redundant resets), magic numbers instead of design tokens, overly broad or overly specific selectors, and dead/unused styles. Framework-agnostic — applies to any language or CSS approach.
user-invocable: false
---

# Styling Patterns

A checklist for catching unnecessary, defensive, or cargo-cult styling code — the kind
that gets copy-pasted "because it's needed sometimes" without anyone confirming it's
needed *here*. Applies regardless of styling approach (plain CSS, CSS Modules, Tailwind,
CSS-in-JS, inline styles).

The core principle: **every non-obvious style rule should exist because of a diagnosed
problem, not as a precaution.** If you can't say what breaks without a given line, it
probably shouldn't be there — or it needs a comment explaining what it fixes.

## 1. Don't add "just in case" defensive fixes

Common hacks that get pasted reflexively, most of which are only needed in specific
circumstances:

- `min-width: 0` / `min-height: 0` on a flex or grid child — only needed when that child
  contains text/content that must truncate or shrink below its content size (e.g.
  `overflow: hidden; text-overflow: ellipsis` inside a flex item). If nothing inside needs
  to shrink or truncate, it does nothing and is noise.
- `overflow: hidden` added to "fix" a layout issue without knowing which child is
  overflowing or why — this masks the actual cause (often a missing `min-width: 0`,
  an unconstrained image, or a margin-collapse issue) instead of fixing it.
- `!important` to win a specificity fight — almost always means the actual selector
  structure is wrong. Fix the specificity/source order instead of overriding it.
- `position: relative` added to a parent "just in case" a child needs `absolute`
  positioning later, when no child currently uses it.
- Arbitrary `z-index` jumps (`z-index: 9999`) instead of a small, deliberate stacking
  scale. Signals nobody understands the actual stacking context.
- `box-sizing: border-box` reset added manually when the project already has a global
  reset (Tailwind Preflight, normalize.css, a CSS-in-JS global style) that sets it.
- Vendor prefixes for properties that no longer need them (check caniuse / the project's
  browserslist before adding `-webkit-`/`-moz-` prefixes).

**When you do need one of these fixes:** add it, but leave a one-line comment saying what
it fixes (`/* min-w-0: allows truncation of long filenames below */`), so the next person
doesn't have to guess whether it's load-bearing before removing it.

## 2. Don't duplicate what the framework/reset already provides

Before adding a rule, check whether the base layer already handles it:
- Tailwind's Preflight already resets margins, `box-sizing`, list styles, etc. — don't
  re-declare them per-component.
- A CSS-in-JS global/theme provider often already sets base typography, box-sizing, and
  color scheme — check before overriding at the component level.
- Don't reintroduce a reset library rule as an inline override "to be safe."

## 3. Magic numbers vs. design tokens

- Prefer theme/design-token values (spacing scale, color palette, breakpoints, radius
  scale) over hardcoded pixel/hex values, when the project has such a system (Tailwind
  config, CSS custom properties, a theme object).
- A one-off value is fine when it's genuinely one-off (e.g. matching an external asset's
  exact size) — but if the same magic number shows up in more than one place, it should
  become a token/variable.
- Don't hardcode colors that duplicate an existing token (`#3b82f6` instead of
  `theme.colors.blue-500` / `bg-blue-500`).

## 4. Selector scope: not too broad, not too specific

- Avoid selectors broad enough to leak into unrelated elements (`div > span { ... }` at
  global scope) — scope to a class, module, or component boundary.
- Avoid unnecessarily specific selectors (`#app .sidebar div.item > span.label`) when a
  single class would do — high specificity makes future overrides harder and often leads
  straight back to `!important`.
- In CSS Modules / scoped CSS-in-JS, don't add manual BEM-style naming for scoping that
  the tool already guarantees.

## 5. Utility-first frameworks (Tailwind, UnoCSS, etc.)

- Don't write custom CSS or inline `style={{ }}` for something a utility class already
  covers — check the utility set before reaching for custom styles.
- Don't stack contradictory/redundant utility classes (e.g. both `flex` and `block`,
  or `w-full` alongside a conflicting fixed `w-[240px]`) — the last one silently wins and
  the other is dead weight.
- Extract a component/variant (e.g. via `cva`, a wrapper component) instead of repeating
  a long, identical utility string across many call sites — repeated long class strings
  are a sign the abstraction belongs in one place.
- Don't add arbitrary-value utilities (`top-[13px]`, `w-[327px]`) as a substitute for
  fixing actual layout logic, unless matching a genuine fixed external constraint.

## 6. Dead and unused styles

- Remove CSS classes/rules no longer referenced by any markup — check before leaving
  them "in case something still uses it."
- Remove leftover vendor-prefixed or fallback rules for browsers the project no longer
  supports (check the project's browserslist/target config).
- Watch for duplicate rules across files that could be consolidated (the same
  component-specific override redefined in two stylesheets).

## 7. Layout debugging discipline

When something looks visually broken and the instinct is to add a fix:
1. Identify which element is actually the problem (inspect computed styles / box model)
   before adding a rule.
2. Prefer the minimal, targeted fix over a broad one (fix the actual overflowing child,
   not `overflow: hidden` on a distant ancestor).
3. If the fix is non-obvious (most `min-width: 0`, negative margin, or z-index fixes
   are), comment why it's there.

---

## Review workflow

When writing or reviewing styling code:
1. For each non-trivial rule (anything beyond basic layout/spacing/color), ask: what
   breaks without this line? If you can't answer, question whether it should be there.
2. Check for cargo-cult fixes from §1 with no corresponding problem in this markup.
3. Check for duplication with the framework's reset/theme (§2) and magic numbers that
   should be tokens (§3).
4. Check selector/utility hygiene (§4–5) and dead styles (§6).
5. Flag findings with the specific rule and why it's unnecessary, not just "this looks
   off" — and propose the minimal replacement.
