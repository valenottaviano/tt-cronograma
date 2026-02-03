# Firebase Storage CORS Setup

The public tracks page fetches raw `.gpx` files from Firebase Storage so the
`TrackPreview` component can parse them client-side. Storage buckets do not send
`Access-Control-Allow-Origin` headers by default, so browsers block the request
with a CORS error such as:

```
Access to fetch at 'https://firebasestorage.googleapis.com/v0/b/.../tracks%2Ffoo.gpx'
from origin 'http://localhost:3000' has been blocked by CORS policy.
```

## 1. Create a CORS config

Add the domains you need (`localhost`, staging, prod) to a JSON file, e.g.
`cors.json`:

```json
[
  {
    "origin": [
      "http://localhost:3000",
      "https://tt.run",           // producción
      "https://staging.tt.run"    // staging (ajusta si es otro dominio)
    ],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
```

Feel free to add other headers if you need them (e.g. `Authorization`).

## 2. Apply the config to the bucket

Use `gsutil` (part of the Google Cloud SDK) and point it to your bucket
(`web-tt-94ad5` in this project):

```bash
gsutil cors set cors.json gs://web-tt-94ad5.appspot.com
```

Run `gsutil cors get gs://web-tt-94ad5.appspot.com` to verify the active
configuration. CORS updates propagate within a few minutes.

## 3. Re-test

Reload `http://localhost:3000/tracks`. Fetches for the GPX files should now
include the `Access-Control-Allow-Origin` header and the preview canvas will
render instead of showing the error fallback.

> Tip: if new environments are added later, append their origins to the same
`cors.json` file and rerun `gsutil cors set`.
