## Scope

Convert 4 uploaded HTML files (~4,400 lines total) into React/TanStack Start routes that render **pixel-identical** to the originals (RTL Arabic, Tajawal/Cairo fonts, green+gold theme).

## Approach

The HTMLs use heavy custom CSS with very specific class names and selectors. To guarantee 100% visual parity (your hard requirement), I will:

1. **Keep the original CSS verbatim** per route as a scoped `<style>` block inside each route component. This avoids any drift from re-implementing styles in Tailwind/shadcn.
2. **Port the markup to JSX** (convert `class` → `className`, self-close tags, escape RTL chars).
3. **Use shadcn components where they integrate without altering visuals** — primarily `Input`, `Button` (as `asChild` wrappers preserving original classes), `Card` only where it matches. Heavy custom UI (sidebars, dashboards) stays as plain styled JSX since wrapping them in shadcn would break the layout.
4. **Load Arabic fonts** (Tajawal, Cairo) once in `__root.tsx` via Google Fonts link tags. Set `dir="rtl"` and `lang="ar"` on `<html>`.
5. **Copy the logo** `logo_transparent.png` to `src/assets/` and import it in each route that uses it.

## Routes

```
/                       → Landing page  (index.html)        — public
/gate                   → Password gate (dashboard.html)    — password "saaid2025" → /admin (matches original JS)
/admin                  → Admin dashboard (admin-dashboard.html)
/association            → Association dashboard (association-dashboard.html)
```

The gate uses client-side `sessionStorage` to gate the dashboards (same as the original HTML's intent). No backend.

## File structure

```
src/routes/
  __root.tsx               (add RTL + fonts)
  index.tsx                (landing)
  gate.tsx                 (login gate)
  admin.tsx                (admin dashboard)
  association.tsx          (association dashboard)
src/assets/
  saaid-logo.png
```

Inline interactivity from the originals (tab switching, mobile menu toggle, password submit, sidebar nav highlight) is ported to small `useState` handlers — behavior stays identical.

## Out of scope

- No backend, no auth provider, no DB.
- No responsive redesign beyond what the originals already have.
- No translation — content stays Arabic.

## Deliverable

Four routes that render identically to the source HTML when viewed in the preview, navigable via the URLs above.
