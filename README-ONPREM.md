# On-premise player

A build of the Personaliz player that runs entirely on the host's own
infrastructure. No request reaches Personaliz while a recipient is watching —
not for the video, not for their data, not for analytics, not for a font.

## What this is

The stock player asks our API one question on load and gets everything back:
the video address, the overlay design, the recipient's values and a session.
That is impossible for a host who requires that nothing leave their network.

So the same information is split into two files served from the host's own
domain, and the calls that phoned home are gone.

```
public/onprem/
  video_d53f2d06.json    Arabic campaign: 87 elements, timings, animations,
                         and the video address. No personal data — the same
                         file for every recipient, cacheable indefinitely.
  video_28bf7be5.json    English campaign: 61 elements, its own film.
  contact1.json          one recipient's values, serving both campaigns.
                         THIS is the file a host replaces with their lookup.
  media/                 local copies of both films, used only if you point
                         a campaign's video_url back at them
  images/                overlay artwork — logo, crest, channel icons
  fonts/                 Cairo, self-hosted
  chrome/                the player's own icons
```

A campaign is one film plus one overlay, so the two languages are two
campaigns, each standing alone and chosen by `id` in the link. There is no
language switch button — changing language means opening the other link.

## Running it

```bash
npm install
npm run build          # emits ./out — plain HTML, JS, CSS and assets
```

No configuration step. Every setting has a working default in the source, so
a fresh clone builds correctly; `.env.example` documents the few knobs and is
needed only to change one. Env files themselves are gitignored, which is why
the defaults are not kept in one.

Serve `out/` from any ordinary web server. There is no Node process, nothing
to install and no runtime dependency on Personaliz.

```
https://<host>/?id=d53f2d06&uid=<recipient token>     Arabic
https://<host>/?id=28bf7be5&uid=<recipient token>     English
```

The one requirement on the server is that it answers HTTP range requests, so
the video streams rather than downloading whole. nginx, IIS, Apache and
S3+CloudFront all do this by default.

Not every server does, and the failure is quiet — the browser downloads the
whole file and seeking behaves oddly, rather than erroring. Python's
`http.server` is the trap worth naming: it ignores `Range` and answers `200`
with the entire file. Do not judge streaming behaviour against it. To check a
candidate server, look for `Accept-Ranges: bytes` and a `206` status on the
video request in the browser's network panel.

### Where the films are served from

Both campaigns address their film by a plain URL, currently a CloudFront
distribution. That is the only remote origin this build contacts, it is a
`<video>` load, and nothing about the recipient travels with it. To serve the
films from your own infrastructure, copy them there and edit `video_url` in
the two campaign files. Nothing else changes.

## Wiring in your own data

One function, in `src/app/onprem/onpremData.js`:

```js
export function fetchRecipient(contactId) {
  return getJson(`${BASE}/contact1.json`);   // ← replace this line
}
```

It receives the token already in the play URL and must return
`{ variables: { name: value, ... } }`. The names are the ones the overlay
references — `companynamear`, `totalWorkersCount`, `owner1_name` and so on;
`contact1.json` is a complete working example of the shape.

Nothing else changes. Everything downstream reads that map by name and does
not care where it came from.

If your API is on another origin, allow it — see the guard, below:

```
NEXT_PUBLIC_ONPREM_ALLOWED_ORIGINS=https://api.your-domain
```

## How "nothing leaves" is enforced

Not by having found and deleted every call. That is a claim about today's
code, and the next merge from upstream can add another one.

`src/app/onprem/networkGuard.js` wraps `fetch` and `XMLHttpRequest` and refuses
anything that is not same-origin or explicitly allowed. It installs at module
scope, before the first request is issued.

What it refuses is recorded. Open the console on a running deployment:

```js
window.__blockedCalls        // [] means nothing was even attempted
```

A JS guard cannot intercept what the browser fetches for `<img>`, `<link>` or
`<video>` — those never pass through `fetch`. Those are handled by having no
remote references left to fetch: the fonts and the player's own icons were
downloaded into the bundle and the references rewritten. A Content-Security-
Policy header on your server is the belt-and-braces version, and is worth
adding:

```
Content-Security-Policy: default-src 'self'; media-src 'self'; img-src 'self' data:;
```

## What was removed from the stock player, and why

| Removed | Why |
|---|---|
| `POST /video` first-load call | The call this deployment exists to remove. Replaced by the two files. |
| Device fingerprinting (FingerprintJS) | Identifies the browser. Not something a government host should be sending anywhere. |
| Geo-IP lookup | Sent the viewer's address to a third party. |
| `update_session_data`, `capture_user_exit` | Engagement telemetry to us. |
| `generateMetadata` in `page.js` | Ran server-side and called our API per view. Also forced dynamic rendering, making a static export impossible. |
| Google Fonts at runtime | A third-party request on every view, revealing who is reading a statutory report. Cairo is now bundled. |
| Remote player icons | Were served from our CloudFront and S3. Now in `public/onprem/chrome/`. |

The consequence worth knowing: **no personalised link preview.** The stock
player builds an OpenGraph card per recipient. For a statutory report that is
arguably a gain — nothing about the recipient leaks into a WhatsApp preview.

## Analytics

There is none, by design. If the host wants engagement data, the events exist
in the stock player and can be pointed at an endpoint of theirs — the same
configurable-destination pattern as the data fetch. That is a decision to take
deliberately rather than inherit.

## Updating a campaign

Design changes happen in the Personaliz dashboard and come out as a new
`video_<campaign>.json`. The host replaces that one file. No rebuild, no
redeploy of the player.
