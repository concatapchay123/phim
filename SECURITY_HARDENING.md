# Security and quota hardening

## Production environment variables

Set these in Vercel Project Settings > Environment Variables:

- `PLAYER_TOKEN_SECRET`: long random string, at least 32 characters.
- `SECURITY_LOCK_SECRET`: long random string, different from `PLAYER_TOKEN_SECRET`.
- `ENABLE_STREAM_PROXY`: leave unset or `false` unless you intentionally want video traffic to pass through Vercel Functions.
- `ENABLE_IMAGE_PROXY`: leave unset or `false` unless you intentionally want image traffic to pass through Vercel Functions.
- `ENABLE_LEGACY_PROXY`: leave unset or `false`.

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
