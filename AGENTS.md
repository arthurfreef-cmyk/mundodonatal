<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep browser advertising permission in `advertising-consent.ts` and Pixel dispatch in `meta-pixel.ts`; a single root listener handles navigation to avoid duplicate installs and centralize regional blocking.
- Persist browser advertising choices as versioned notice evidence with visitor, timestamp, region and preserved history; this is a local privacy preference, not a customer database.
- Send only explicitly wired standard commerce events through the browser Pixel, with automatic form collection and customer matching disabled; Purchase requires a confirmed paid status and the processor's actual amount, never Pix creation.
- Preserve legacy advertising notices and refusals when expanding measurement; only acceptance of the current notice authorizes the expanded events in consent regions.
- Use shared Button variants for storefront shopping actions, with a dedicated commerce variant, to keep tap targets and focus states consistent.
- Keep checkout presentation in focused store components and use a simplified checkout header so commerce and payment behavior remain separate from visual changes.
- Keep storefront announcement strips in Header, excluding checkout; use equal repeated groups for seamless scrolling and honor reduced motion.
- Use responsive product image sources and defer alternate product photos until pointer or keyboard interaction to reduce initial image downloads without changing the catalog.
- Use StoreDrawer for cart and mobile navigation so focus trapping, Escape dismissal and scroll locking stay consistent.
- Validate saved cart entries and tolerate unavailable browser storage; persist only after hydration to preserve existing carts.
- Keep the Fruitfy contract in server-only `fruitfy.ts` behind `payments.functions.ts`: totals are recomputed from the catalog in cents, the order is sent as one item with the store product id (Fruitfy rejects repeated ids), and paid status requires Fruitfy's paid date and full paid amount; never synthesize confirmation.
