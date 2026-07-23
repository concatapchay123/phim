# Security and quota hardening

## Production environment variables

Set these in Vercel Project Settings > Environment Variables:

- `PLAYER_TOKEN_SECRET`: random secret of at least 32 characters. Required in production; do not reuse a JWT or application secret.
- `SECURITY_LOCK_SECRET`: a different random secret of at least 32 characters. Required in production.
- `MOVIE_ID_SECRET`: optional separate random secret used to encrypt opaque movie identifiers. If omitted, the application derives this key from `PLAYER_TOKEN_SECRET` for backwards-compatible deployment.
- `ENABLE_STREAM_PROXY`: leave unset or `false` unless you intentionally want video traffic to pass through Vercel Functions.
- `ENABLE_IMAGE_PROXY`: leave unset or `false` unless you intentionally want image traffic to pass through Vercel Functions.
- `ENABLE_LEGACY_PROXY`: leave unset or `false`.

The application deliberately fails closed for signed image/stream URLs and the
server-side security lock when these secrets are not configured in production.
Use a password manager or `openssl rand -base64 48` to generate each value.

## What the browser can and cannot protect

The DevTools detector is enabled as a user-interface deterrent: it locks the
current browser session and reports the signal to the server. It is not a
security boundary, because users can modify JavaScript, use an undocked
inspector, or replay any request their browser is authorized to make.

Real protection in this project is enforced on the server: restricted API
paths and query parameters, strict same-origin request checks, signed
purpose-bound proxy tokens, private-network target blocking, disabled-by-
default proxies, response sanitisation and rate limits. Direct requests that
do not originate from the site now receive `403`.

No website can hide JavaScript, HTML, images, or a non-DRM video stream once
they have been delivered to a viewer. If the video itself must be protected,
use a licensed DRM provider (for example Widevine/FairPlay/PlayReady) with
authenticated, short-lived playback licences. Do not treat obfuscation,
minification, disabled right-click, or DevTools detection as DRM.

## Recommended Vercel Firewall rules

Use Vercel Firewall before application code. Suggested starting rules:

- Rate limit `/api/c*`: 120 requests per 60 seconds per IP, action 429 or Challenge.
- Rate limit `/api/player*`: 30 requests per 60 seconds per IP, action 429 or Challenge.
- Block `/api/stream*` unless `ENABLE_STREAM_PROXY=true`.
- Rate limit `/api/i*`: 300 requests per 60 seconds per IP if image proxy is enabled.
- Block obvious scanner paths: `/wp-*`, `/xmlrpc.php`, `/.env`, `/admin*`, `/phpmyadmin*`.
- Challenge or deny empty/bad user agents if traffic charts show abuse.

## Quota notes

Video proxying is the largest quota risk. A single 10 minute playback can transfer gigabytes if HLS segments are relayed through `/api/stream`. The default configuration now plays HLS directly from the upstream source and falls back to embed playback when direct HLS fails.

Image proxying also consumes Function and Fast Origin Transfer quota. The default configuration now returns direct image URLs from allowed image hosts.
