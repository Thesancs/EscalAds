# EscalAds Collector Extension

Chrome extension that captures creatives from Meta Ad Library pages and forwards them to the EscalAds API.

## Development

```bash
# from the repo root
npm install
npm run dev --workspace @escalads/extension
```

The command keeps the bundle in `apps/extension/dist`. In Chrome, load the unpacked extension pointing to that folder.

## Configuration

1. Open the extension options page.
2. Provide the EscalAds API base URL (default is `http://localhost:4000`).
3. Paste the JWT token retrieved from the EscalAds web app (`/auth/login`).

Each captured ad triggers a POST request to `/ads` with the payload defined in `@escalads/shared`.

## Notes

- The selector strategy targets elements rendered by Facebook Ad Library. Tweak `AD_CARD_SELECTORS` when Meta adjusts the markup.
- Only public creative metadata is collected (text, CTA, media URLs). Assets are downloaded by the API worker for further processing.
- The extension stores settings using `chrome.storage.sync` so they sync across Chrome profiles.
