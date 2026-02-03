# Firestore Rules – Tracks Collection

Track CRUD happens in Firestore (`lib/firebase/tracks.ts`). Public pages need
read access, but only authenticated TT admins should create/update/delete.

Add the snippet below to your `firestore.rules` and deploy with
`firebase deploy --only firestore`:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas existentes…

    match /tracks/{trackId} {
      allow read: if true; // hazlo más estricto si en el futuro el detalle es privado
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

This rule expects each admin user to have a document at
`admins/{uid}`. If you add more collections that only admins should mutate,
reuse the same `exists(/admins/$(request.auth.uid))` guard so permissions stay
consistent across the app.
