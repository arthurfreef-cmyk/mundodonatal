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
- Advertise only PageView through the browser Pixel with automatic event collection disabled; customer matching and payment reporting are not part of this integration.
