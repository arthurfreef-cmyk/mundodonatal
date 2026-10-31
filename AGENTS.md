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
