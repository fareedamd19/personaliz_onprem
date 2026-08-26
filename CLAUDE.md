# CLAUDE.md — Personaliz player (play-frontend-new)

Next.js app router, source under `src/app/`. `npm run dev` (turbo).

This is what the recipient opens. It is public and unauthenticated, so every value that
reaches it — the overlay config and the recipient variables alike — is untrusted input
from the database.

One of three repos in the overlay feature. See `../CLAUDE.md` at the workspace root for
the topology and the full schema contract.

NOTE: the overlay engine lives on branch `feat/overlay-engine-v2`. On `main` none of the
files below exist.

## Overlay engine v2

  src/app/utils/overlayElement.js       the model. Pure functions, no DOM, testable.
  src/app/components/Video Conatiner/   VideoContainer.jsx renders elements over the video
  src/app/fixtures/overlay.fixture.js   local fixture config + variables
  src/app/utils/fixtureMode.js          the network guard

(`Video Conatiner` is misspelt in the repo. Leave it — renaming touches every import.)

The model's contract:

  elementType(el)              type, defaulting to "text"
  sampleElement(el, t)         geometry + opacity at time t; interpolates keyframes
  normalizeKeyframes(el)       keyframes sorted by `t`, gaps filled from textbox_*
  shouldRender(el, variables)  visibleIf. FAILS OPEN — bad config shows, never hides
  formatValue(raw, format)     number/percent/currency/date; errors return the raw value
  boundProportion(el, vars)    0..1 from bind.value between bind.min and bind.max
  resolveRef(ref, vars)        string | {var} | {value}
  safeHref(raw)                http(s) only; anything else returns null
  expandRepeaters(els, vars)   {as}/{n} row expansion, before anything else runs

Types handled in VideoContainer: `box`, `image`, `bar`, `arc`, and text as the
fall-through. There is NO `link` type — a clickable element is any type carrying a valid
`href`. If the editor sends `type: "link"` it renders as text that happens to be
clickable.

## Flags

  NEXT_PUBLIC_OVERLAY_V2=1     enables the v2 path. Off means the previous renderer.
  NEXT_PUBLIC_FIXTURE_MODE=1   renders from the local fixture and blocks every request to
                               the Personaliz API at both fetch and XHR level.

Overlay v2 only runs when `firstLoadData.dynamic_text_display.type === "web"`. Campaigns
on the `render` path have text burned in by the backend and never reach this code.

ALWAYS use fixture mode for overlay work. All environments share one production MySQL
instance; client contacts are live rows and a page load writes engagement and session
records against them.

## Open

`VideoContainer.jsx` currently sets

    const variables = isFixtureMode() ? fixtureVariables : {};

In production that map is empty, so bind, visibleIf, format and repeat.countVar are all
inert while plain text still works (the backend substitutes it upstream). Wiring a real
per-recipient map is what makes data-driven charts work.

The backend endpoint exists — `get_overlay_variables` — but is mounted at
`/api/campaign/campaign/overlay-variables/:id` (doubled segment) behind apiKeyAuth, which
this player cannot satisfy. It needs a play-reachable route, or the values folded into the
existing first-load payload.

## Invariants

- A config error must never blank the video. Conditions fail open, formatting errors
  return the raw value, a broken image renders nothing rather than a broken icon.
- Overlay positions are fractions of the RENDERED video box — re-measure on resize.
- Keyframe animation runs imperatively against the video clock, not through React state:
  timeupdate fires far too rarely, and re-rendering per frame drops the video.
